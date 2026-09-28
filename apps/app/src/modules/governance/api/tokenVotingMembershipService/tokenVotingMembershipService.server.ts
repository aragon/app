import 'server-only';
import type { ITokenMember } from '@/plugins/tokenPlugin/types';
import { aragonDomainServiceBackend } from '@/shared/api/aragonDomainService/aragonDomainService.backend';
import { daoService, type IDaoPlugin } from '@/shared/api/daoService';
import type { FetchCacheConfig } from '@/shared/api/httpService';
import { featureFlags } from '@/shared/featureFlags';
import { daoUtils } from '@/shared/utils/daoUtils';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import { governanceService } from '../governanceService/governanceService';
import { mapBackendMemberToTokenVotingDTO } from '../governanceService/utils/mapBackendMemberToTokenVotingDTO';
import type {
    IGetTokenVotingMembershipParams,
    IGetTokenVotingMembershipQueryParams,
    ITokenVotingMembershipPage,
} from './tokenVotingMembershipService.api';
import {
    type ITokenVotingMembershipPluginSettings,
    resolveDomainMembershipRequest,
} from './tokenVotingMembershipService.utils';

/**
 * The DAO is only read to route the query, so a short-lived cached copy is
 * enough and keeps pagination from paying for a DAO round trip per page.
 */
const daoFetchCacheConfig: FetchCacheConfig = {
    cache: 'force-cache',
    next: { revalidate: 60 },
};

/**
 * Serves token-voting member lists and owns the choice of where they come
 * from. Callers ask for the members of a plugin: the aragon-domain source,
 * the feature flag gating it and the legacy fallback all live here, so the UI
 * (and the RSC prefetch, which calls this service directly) never knows which
 * source answered.
 */
class TokenVotingMembershipServiceServer {
    /**
     * A list stays on the source that served its first page. The `source`
     * echoed back with every next page pins it: a recovering domain cannot
     * take over a backend list, and a domain list never continues on the
     * backend, since splicing pages with different ordering and counts would
     * duplicate or skip members. Only a first page may fall back.
     */
    getTokenVotingMembership = async ({
        queryParams,
    }: IGetTokenVotingMembershipParams): Promise<ITokenVotingMembershipPage> => {
        const { daoId, pluginAddress, page, source } = queryParams;
        const isFirstPage = page == null || page === 1;

        if (source === 'backend') {
            return this.getBackendMembership(queryParams);
        }

        let domainPage: ITokenVotingMembershipPage | undefined;

        try {
            domainPage = await this.getDomainMembership(queryParams);
        } catch (error) {
            if (!isFirstPage) {
                throw error;
            }

            // The error is swallowed here, so it is logged here: errors that
            // propagate are logged by the route handler instead.
            monitoringUtils.logError(error, {
                context: {
                    errorType: 'token_voting_membership_domain_error',
                    daoId,
                    pluginAddress,
                    page,
                },
            });
        }

        if (domainPage != null) {
            return domainPage;
        }

        if (source === 'domain' && !isFirstPage) {
            throw new Error(
                'TokenVotingMembershipServiceServer: the domain no longer serves a list it started',
            );
        }

        return this.getBackendMembership(queryParams);
    };

    /**
     * Serves a page from the aragon-domain, or `undefined` when the domain
     * does not cover the plugin (flag off, network not indexed, wrapped or
     * escrow token, other plugin type). Throws when the DAO cannot be read or
     * the domain call fails, leaving the fallback decision to the caller.
     */
    private getDomainMembership = async (
        queryParams: IGetTokenVotingMembershipQueryParams,
    ): Promise<ITokenVotingMembershipPage | undefined> => {
        const { daoId, pluginAddress, page, pageSize } = queryParams;

        if (!(await featureFlags.isEnabled('domainMemberList'))) {
            return;
        }

        const dao = await daoService.getDao(
            { urlParams: { id: daoId } },
            { fetchCacheConfig: daoFetchCacheConfig },
        );

        const plugin = daoUtils.getDaoPlugins(dao, {
            pluginAddress,
            includeSubPlugins: true,
            includeLinkedAccounts: true,
        })?.[0] as IDaoPlugin<ITokenVotingMembershipPluginSettings> | undefined;

        const domainRequest = resolveDomainMembershipRequest({ dao, plugin });

        if (domainRequest == null) {
            return;
        }

        const result = await aragonDomainServiceBackend
            .getDomain()
            .getTokenVotingMembership({ ...domainRequest, page, pageSize });

        if (!result.success) {
            throw new Error(
                'TokenVotingMembershipServiceServer: getTokenVotingMembership failed',
                { cause: result.error },
            );
        }

        return { ...result.result, source: 'domain' };
    };

    private getBackendMembership = async ({
        daoId,
        pluginAddress,
        page,
        pageSize,
    }: IGetTokenVotingMembershipQueryParams): Promise<ITokenVotingMembershipPage> => {
        const result = await governanceService.getMemberList<ITokenMember>({
            queryParams: { daoId, pluginAddress, page, pageSize },
        });

        return {
            ...result,
            data: result.data.map(mapBackendMemberToTokenVotingDTO),
            source: 'backend',
        };
    };
}

export const tokenVotingMembershipServiceServer =
    new TokenVotingMembershipServiceServer();
