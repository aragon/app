// The `next/navigation` alias points to the client-hooks wrapper, which cannot re-export server functions.
import { notFound } from 'next/navigation-original';
import { Page } from '@/shared/components/page';
import { featureFlags } from '@/shared/featureFlags';
import type { IWorkspacePageParams } from '@/shared/types';
import { WorkspaceProposalsPageClient } from './workspaceProposalsPageClient';

export interface IWorkspaceProposalsPageProps {
    /**
     * URL parameters of the page.
     */
    params: Promise<IWorkspacePageParams>;
}

/**
 * Number of proposals read per page. Matches the DAO proposals page; the workspace API caps the page size at 50.
 */
export const workspaceProposalsCount = 10;

/**
 * Aggregated proposals of a workspace.
 *
 * Nothing is prefetched: the proposal queries need the account list, which only exists in the local-storage
 * registry and is therefore resolved on the client (see `docs/projectDocs/createWorkspace.md`).
 */
export const WorkspaceProposalsPage: React.FC<
    IWorkspaceProposalsPageProps
> = async (props) => {
    const { params } = props;

    if (!(await featureFlags.isEnabled('workspaces'))) {
        notFound();
    }

    const { workspaceId } = await params;

    return (
        <Page.Container>
            <WorkspaceProposalsPageClient
                pageSize={workspaceProposalsCount}
                workspaceId={workspaceId}
            />
        </Page.Container>
    );
};
