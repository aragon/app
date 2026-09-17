// The `next/navigation` alias points to the client-hooks wrapper, which cannot re-export server functions.
import { notFound } from 'next/navigation-original';
import { Page } from '@/shared/components/page';
import { featureFlags } from '@/shared/featureFlags';
import type { IWorkspacePageParams } from '@/shared/types';
import { WorkspaceAssetsPageClient } from './workspaceAssetsPageClient';

export interface IWorkspaceAssetsPageProps {
    /**
     * URL parameters of the page.
     */
    params: Promise<IWorkspacePageParams>;
}

/**
 * Number of assets read per page. Matches the DAO assets page; the workspace API caps the page size at 50.
 */
export const workspaceAssetsCount = 20;

/**
 * Aggregated assets of a workspace.
 *
 * Nothing is prefetched: the asset queries need the account list, which only exists in the local-storage registry
 * and is therefore resolved on the client (see `docs/projectDocs/createWorkspace.md`).
 */
export const WorkspaceAssetsPage: React.FC<IWorkspaceAssetsPageProps> = async (
    props,
) => {
    const { params } = props;

    if (!(await featureFlags.isEnabled('workspaces'))) {
        notFound();
    }

    const { workspaceId } = await params;

    return (
        <Page.Container>
            <WorkspaceAssetsPageClient
                pageSize={workspaceAssetsCount}
                workspaceId={workspaceId}
            />
        </Page.Container>
    );
};
