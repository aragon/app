import { QueryClient } from '@tanstack/react-query';
import { cmsService, daoOverridesOptions } from '@/shared/api/cmsService';
import { daoOptions, PluginInterfaceType } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { RedirectToUrl } from '@/shared/components/redirectToUrl';
import { type IDaoPageParams, PluginType } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { daoVisibilityUtils } from '@/shared/utils/daoVisibilityUtils';
import { networkUtils } from '@/shared/utils/networkUtils';
import {
    buildTokenVotingMembershipParams,
    memberListOptions,
} from '../../api/governanceService';
import { tokenVotingMembershipOptionsServer } from '../../api/governanceService/queries/useTokenVotingMembership/useTokenVotingMembership.server';
import { DaoMembersPageClient } from './daoMembersPageClient';

/**
 * Plugins whose member list renders through `TokenMemberListBase` and thus
 * consumes the token-voting membership query instead of the generic member
 * list — the prefetch below must target the same query key.
 */
const tokenVotingMembershipPlugins: PluginInterfaceType[] = [
    PluginInterfaceType.TOKEN_VOTING,
    PluginInterfaceType.LOCK_TO_VOTE,
];

export interface IDaoMembersPageProps {
    /**
     * DAO page parameters.
     */
    params: Promise<IDaoPageParams>;
}

export const daoMembersCount = 18;

export const DaoMembersPage: React.FC<IDaoMembersPageProps> = async (props) => {
    const { params } = props;
    const daoPageParams = await params;

    if (!networkUtils.isValidNetwork(daoPageParams.network)) {
        // invalid network handled in DAO layout
        return null;
    }

    const queryClient = new QueryClient();

    const daoId = await daoUtils.resolveDaoId(daoPageParams);
    const daoUrlParams = { id: daoId };
    const [dao, daoOverrides, featuredDelegates] = await Promise.all([
        queryClient.fetchQuery(daoOptions({ urlParams: daoUrlParams })),
        queryClient.fetchQuery(daoOverridesOptions()),
        cmsService.getFeaturedDelegates(),
    ]);

    const daoOverride = daoOverrides[daoId];

    const allBodyPlugins =
        daoUtils.getDaoPlugins(dao, {
            type: PluginType.BODY,
            includeSubPlugins: true,
            includeLinkedAccounts: true,
        }) ?? [];

    const plugins = daoVisibilityUtils.filterHiddenPlugins(
        allBodyPlugins,
        daoOverride,
    );

    if (!plugins.length) {
        const daoUrl = daoUtils.getDaoUrl(dao, 'dashboard')!;
        return <RedirectToUrl url={daoUrl} />;
    }

    const bodyPlugin = plugins[0];
    const memberListQueryParams = {
        daoId,
        pluginAddress: bodyPlugin.address,
        pageSize: daoMembersCount,
    };
    const memberListParams = { queryParams: memberListQueryParams };

    // Token-voting / lock-to-vote lists consume the token-voting membership
    // query; every other plugin uses the generic member list. The prefetched
    // key must match what the list component builds on the client.
    if (tokenVotingMembershipPlugins.includes(bodyPlugin.interfaceType)) {
        await queryClient.prefetchInfiniteQuery(
            tokenVotingMembershipOptionsServer(
                buildTokenVotingMembershipParams(
                    memberListParams,
                    bodyPlugin,
                    dao,
                ),
            ),
        );
    } else {
        await queryClient.prefetchInfiniteQuery(
            memberListOptions({ queryParams: memberListQueryParams }),
        );
    }

    return (
        <Page.Container queryClient={queryClient}>
            <Page.Content>
                <DaoMembersPageClient
                    featuredDelegates={featuredDelegates}
                    initialParams={memberListParams}
                />
            </Page.Content>
        </Page.Container>
    );
};
