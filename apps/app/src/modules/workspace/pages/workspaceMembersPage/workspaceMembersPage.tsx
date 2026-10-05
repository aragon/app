// The `next/navigation` alias points to the client-hooks wrapper, which cannot re-export server functions.
import { notFound } from 'next/navigation-original';
import { Page } from '@/shared/components/page';
import { featureFlags } from '@/shared/featureFlags';
import type { IWorkspacePageParams } from '@/shared/types';
import { WorkspaceMembersPageClient } from './workspaceMembersPageClient';

export interface IWorkspaceMembersPageProps {
    /**
     * URL parameters of the page.
     */
    params: Promise<IWorkspacePageParams>;
}

/**
 * Number of members read per page. Matches the DAO members page; the workspace API caps the page size at 50.
 */
export const workspaceMembersCount = 18;

/**
 * Aggregated members of a workspace.
 *
 * Nothing is prefetched: the member query needs the account list, which only exists in the local-storage registry
 * and is therefore resolved on the client (see `docs/projectDocs/createWorkspace.md`).
 */
export const WorkspaceMembersPage: React.FC<
    IWorkspaceMembersPageProps
> = async (props) => {
    const { params } = props;

    if (!(await featureFlags.isEnabled('workspaces'))) {
        notFound();
    }

    const { workspaceId } = await params;

    return (
        <Page.Container>
            <WorkspaceMembersPageClient
                pageSize={workspaceMembersCount}
                workspaceId={workspaceId}
            />
        </Page.Container>
    );
};
