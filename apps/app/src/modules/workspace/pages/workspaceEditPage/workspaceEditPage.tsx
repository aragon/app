// The `next/navigation` alias points to the client-hooks wrapper, which cannot re-export server functions.
import { notFound } from 'next/navigation-original';
import { Page } from '@/shared/components/page';
import { featureFlags } from '@/shared/featureFlags';
import type { IWorkspacePageParams } from '@/shared/types';
import { WorkspaceGate } from '../../components/workspaceGate';
import { WorkspaceEditPageClient } from './workspaceEditPageClient';

export interface IWorkspaceEditPageProps {
    /**
     * URL parameters of the page.
     */
    params: Promise<IWorkspacePageParams>;
}

/**
 * Edits the metadata, targets and accounts of a workspace through the steps of the create-workspace wizard.
 *
 * Nothing is prefetched: the page edits the workspace itself, which only exists in the local-storage registry and is
 * therefore resolved on the client (see `docs/projectDocs/createWorkspace.md`). The page sits under the wizard layout
 * rather than `LayoutWorkspace`, so it renders the `WorkspaceGate` that layout would otherwise provide.
 */
export const WorkspaceEditPage: React.FC<IWorkspaceEditPageProps> = async (
    props,
) => {
    const { params } = props;

    if (!(await featureFlags.isEnabled('workspaces'))) {
        notFound();
    }

    const { workspaceId } = await params;

    return (
        <Page.Container>
            <WorkspaceGate workspaceId={workspaceId}>
                <WorkspaceEditPageClient workspaceId={workspaceId} />
            </WorkspaceGate>
        </Page.Container>
    );
};
