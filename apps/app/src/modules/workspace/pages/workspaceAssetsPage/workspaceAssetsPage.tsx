import { QueryClient } from '@tanstack/react-query';
import { workspaceAssetListOptions } from '@/modules/workspace/api/workspaceFinanceService';
import { workspaceOptions } from '@/modules/workspace/api/workspaceService';
import { Page } from '@/shared/components/page';
import type { IWorkspacePageParams } from '@/shared/types';
import { WorkspaceAssetsPageClient } from './workspaceAssetsPageClient';

export interface IWorkspaceAssetsPageProps {
    /**
     * Workspace page parameters.
     */
    params: Promise<IWorkspacePageParams>;
}

export const workspaceAssetsCount = 20;

export const WorkspaceAssetsPage: React.FC<IWorkspaceAssetsPageProps> = async (
    props,
) => {
    const { params } = props;
    const { workspaceId } = await params;

    const queryClient = new QueryClient();

    // Resolving the workspace is a local lookup while the API is mocked, so it is cheap to repeat here even though
    // the layout already fetched it. The account DAOs are prefetched by the layout.
    const workspace = await queryClient.fetchQuery(
        workspaceOptions({ urlParams: { id: workspaceId } }),
    );

    const daoIds = workspace.accounts.map((account) => account.id);

    await queryClient.prefetchQuery(
        workspaceAssetListOptions({ queryParams: { daoIds } }),
    );

    return (
        <Page.Container queryClient={queryClient}>
            <WorkspaceAssetsPageClient
                pageSize={workspaceAssetsCount}
                workspaceId={workspaceId}
            />
        </Page.Container>
    );
};
