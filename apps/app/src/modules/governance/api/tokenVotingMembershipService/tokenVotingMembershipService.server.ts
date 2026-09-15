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
    getTokenVotingMembership = async ({
        queryParams,
    }: IGetTokenVotingMembershipParams): Promise<ITokenVotingMembershipPage> => {
        const { daoId, pluginAddress, page, pageSize, source } = queryParams;
        const isFirstPage = page == null || page === 1;

        // `source` pins a list that already started on the legacy backend, so
        // a recovering domain cannot swap sources mid-scroll.
        const domainRequest =
            source === 'backend'
                ? undefined
                : await this.resolveDomainRequest(queryParams);

        if (domainRequest != null) {
            try {
                const result = await aragonDomainServiceBackend
                    .getDomain()
                    .getTokenVotingMembership({
                        ...domainRequest,
                        page,
                        pageSize,
                    });

                if (!result.success) {
                    throw new Error(
                        'TokenVotingMembershipServiceServer: getTokenVotingMembership failed',
                        { cause: result.error },
                    );
                }

                return { ...result.result, source: 'domain' };
            } catch (error) {
                monitoringUtils.logError(error, {
                    context: {
                        errorType: 'token_voting_membership_domain_error',
                        daoId,
                        pluginAddress,
                        page,
                    },
                });

                // Falling back mid-list would splice backend pages into a
                // domain list: different ordering and counts mean duplicated
                // or skipped members. Only a whole list may change source.
                if (!isFirstPage) {
                    throw error;
                }
            }
        }

        const result = await governanceService.getMemberList<ITokenMember>({
            queryParams: { daoId, pluginAddress, page, pageSize },
        });

        return {
            ...result,
            data: result.data.map(mapBackendMemberToTokenVotingDTO),
            source: 'backend',
        };
    };

    /**
     * Resolves the domain request for a query, or `undefined` when the legacy
     * backend must serve it. Any failure to resolve the DAO routes to the
     * backend as well: the list renders either way.
     */
    private resolveDomainRequest = async (
        queryParams: IGetTokenVotingMembershipQueryParams,
    ) => {
        const { daoId, pluginAddress } = queryParams;

        if (!(await featureFlags.isEnabled('domainMemberList'))) {
            return;
        }

        try {
            const dao = await daoService.getDao(
                { urlParams: { id: daoId } },
                { fetchCacheConfig: daoFetchCacheConfig },
            );

            const plugin = daoUtils.getDaoPlugins(dao, {
                pluginAddress,
                includeSubPlugins: true,
                includeLinkedAccounts: true,
            })?.[0] as
                | IDaoPlugin<ITokenVotingMembershipPluginSettings>
                | undefined;

            return resolveDomainMembershipRequest({ dao, plugin });
        } catch (error) {
            monitoringUtils.logError(error, {
                context: {
                    errorType: 'token_voting_membership_routing_error',
                    daoId,
                    pluginAddress,
                },
            });
        }
    };
}

export const tokenVotingMembershipServiceServer =
    new TokenVotingMembershipServiceServer();
