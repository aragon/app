// The `next/navigation` alias points to the client-hooks wrapper, which cannot re-export server functions.
import { notFound } from 'next/navigation-original';
import { Page } from '@/shared/components/page';
import { featureFlags } from '@/shared/featureFlags';
import type { IPageSearchParams, IWorkspacePageParams } from '@/shared/types';
import { WorkspaceGate } from '../../components/workspaceGate';
import { workspaceEditStepParam } from '../../utils/workspaceUtils';
import { WorkspaceEditPageClient } from './workspaceEditPageClient';
import { workspaceEditPageUtils } from './workspaceEditPageUtils';

export interface IWorkspaceEditPageProps {
    /**
     * URL parameters of the page.
     */
    params: Promise<IWorkspacePageParams>;
    /**
     * Query parameters of the page, `step` naming the step the wizard opens on.
     */
    searchParams?: Promise<IPageSearchParams>;
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
    const { params, searchParams } = props;

    if (!(await featureFlags.isEnabled('workspaces'))) {
        notFound();
    }

    const { workspaceId } = await params;
    const initialStep = workspaceEditPageUtils.resolveInitialStep(
        (await searchParams)?.[workspaceEditStepParam],
    );

    return (
        <Page.Container>
            <WorkspaceGate workspaceId={workspaceId}>
                <WorkspaceEditPageClient
                    initialStep={initialStep}
                    workspaceId={workspaceId}
                />
            </WorkspaceGate>
        </Page.Container>
    );
};
