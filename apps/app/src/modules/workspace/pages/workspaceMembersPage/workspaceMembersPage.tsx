import { QueryClient } from '@tanstack/react-query';
import { memberListOptions } from '@/modules/governance/api/governanceService';
import { workspaceOptions } from '@/modules/workspace/api/workspaceService';
import { workspaceBodyUtils } from '@/modules/workspace/utils/workspaceBodyUtils';
import { cmsService, daoOverridesOptions } from '@/shared/api/cmsService';
import { daoOptions } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import type { IWorkspacePageParams } from '@/shared/types';
import { WorkspaceMembersPageClient } from './workspaceMembersPageClient';

export interface IWorkspaceMembersPageProps {
    /**
     * Workspace page parameters.
     */
    params: Promise<IWorkspacePageParams>;
}

export const workspaceMembersCount = 18;

export const WorkspaceMembersPage: React.FC<
    IWorkspaceMembersPageProps
> = async (props) => {
    const { params } = props;
    const { workspaceId } = await params;

    const queryClient = new QueryClient();

    const workspace = await queryClient.fetchQuery(
        workspaceOptions({ urlParams: { id: workspaceId } }),
    );

    const [accountDaoList, daoOverrides, featuredDelegates] = await Promise.all(
        [
            Promise.all(
                workspace.accounts.map((account) =>
                    queryClient.fetchQuery(
                        daoOptions({ urlParams: { id: account.id } }),
                    ),
                ),
            ),
            queryClient.fetchQuery(daoOverridesOptions()),
            cmsService.getFeaturedDelegates(),
        ],
    );

    const accountDaos = workspace.accounts.map((account, index) => ({
        account,
        dao: accountDaoList[index],
    }));

    const bodyPlugins = workspaceBodyUtils.getBodyPlugins({
        accountDaos,
        daoOverrides,
    });

    // Prefetch the body that renders first. A body installed on a linked account is queried against that child DAO,
    // so the child DAO is prefetched too — the member list resolves it for the member links and the aside.
    const firstBody = bodyPlugins[0];

    if (firstBody != null) {
        await Promise.all([
            firstBody.daoId === firstBody.accountDaoId
                ? Promise.resolve()
                : queryClient.prefetchQuery(
                      daoOptions({ urlParams: { id: firstBody.daoId } }),
                  ),
            queryClient.prefetchInfiniteQuery(
                memberListOptions({
                    queryParams: {
                        daoId: firstBody.daoId,
                        pluginAddress: firstBody.meta.address,
                        pageSize: workspaceMembersCount,
                    },
                }),
            ),
        ]);
    }

    return (
        <Page.Container queryClient={queryClient}>
            <Page.Content>
                <WorkspaceMembersPageClient
                    featuredDelegates={featuredDelegates}
                    pageSize={workspaceMembersCount}
                    workspaceId={workspaceId}
                />
            </Page.Content>
        </Page.Container>
    );
};
