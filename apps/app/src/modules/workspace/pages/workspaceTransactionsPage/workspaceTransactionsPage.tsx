import { QueryClient } from '@tanstack/react-query';
import { workspaceTransactionListOptions } from '@/modules/workspace/api/workspaceFinanceService';
import { workspaceOptions } from '@/modules/workspace/api/workspaceService';
import { Page } from '@/shared/components/page';
import type { IWorkspacePageParams } from '@/shared/types';
import { WorkspaceTransactionsPageClient } from './workspaceTransactionsPageClient';

export interface IWorkspaceTransactionsPageProps {
    /**
     * Workspace page parameters.
     */
    params: Promise<IWorkspacePageParams>;
}

export const workspaceTransactionsCount = 20;

export const WorkspaceTransactionsPage: React.FC<
    IWorkspaceTransactionsPageProps
> = async (props) => {
    const { params } = props;
    const { workspaceId } = await params;

    const queryClient = new QueryClient();

    // Resolving the workspace is a local lookup while the API is mocked, so it is cheap to repeat here even though
    // the layout already fetched it. The account DAOs are prefetched by the layout.
    const workspace = await queryClient.fetchQuery(
        workspaceOptions({ urlParams: { id: workspaceId } }),
    );

    const daoIds = workspace.accounts.map((account) => account.id);

    await queryClient.prefetchInfiniteQuery(
        workspaceTransactionListOptions({
            queryParams: { daoIds, pageSize: workspaceTransactionsCount },
        }),
    );

    return (
        <Page.Container queryClient={queryClient}>
            <WorkspaceTransactionsPageClient
                pageSize={workspaceTransactionsCount}
                workspaceId={workspaceId}
            />
        </Page.Container>
    );
};
