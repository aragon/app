import { QueryClient } from '@tanstack/react-query';
import { cmsService, daoOverridesOptions } from '@/shared/api/cmsService';
import { daoOptions } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { RedirectToUrl } from '@/shared/components/redirectToUrl';
import { featureFlags } from '@/shared/featureFlags';
import { type IDaoPageParams, PluginType } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { daoVisibilityUtils } from '@/shared/utils/daoVisibilityUtils';
import { networkUtils } from '@/shared/utils/networkUtils';
import { notFoundUtils } from '@/shared/utils/notFoundUtils';
import {
    buildTokenVotingMembershipParams,
    isTokenMemberListPlugin,
    memberListOptions,
} from '../../api/governanceService';
import { tokenVotingMembershipOptionsServer } from '../../api/governanceService/queries/useTokenVotingMembership/useTokenVotingMembership.server';
import { DaoMembersPageClient } from './daoMembersPageClient';

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

    // Bots constantly probe DAO URLs with unknown or malformed addresses — render the
    // 404 page for those instead of failing the request.
    const daoId = await notFoundUtils.fetchOrNotFound(() =>
        daoUtils.resolveDaoId(daoPageParams),
    );
    const daoUrlParams = { id: daoId };
    // Only the DAO read is addressed by the URL, so only it maps a rejected identifier onto the
    // 404 page. The CMS reads answer "what does the CMS say about DAOs", not "does this DAO
    // exist" — folding them in would turn a content hiccup into a not-found page.
    const [dao, [daoOverrides, featuredDelegates]] = await Promise.all([
        notFoundUtils.fetchOrNotFound(() =>
            queryClient.fetchQuery(daoOptions({ urlParams: daoUrlParams })),
        ),
        Promise.all([
            queryClient.fetchQuery(daoOverridesOptions()),
            cmsService.getFeaturedDelegates(),
        ]),
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

    // Token-voting and lock-to-vote lists consume the token-voting membership
    // query. Every other plugin uses the generic member list. The prefetched
    // key must match what the list component builds on the client, so the
    // domain-source flag is resolved here exactly as the client resolves it.
    if (isTokenMemberListPlugin(bodyPlugin)) {
        const domainSourceEnabled =
            await featureFlags.isEnabled('domainMemberList');
        await queryClient.prefetchInfiniteQuery(
            tokenVotingMembershipOptionsServer(
                buildTokenVotingMembershipParams(
                    memberListParams,
                    bodyPlugin,
                    dao,
                    { domainSourceEnabled },
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
