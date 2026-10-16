'use client';

import { useDialogContext } from '@/shared/components/dialogProvider';
import { Page } from '@/shared/components/page';
import { useWorkspace } from '../../api/workspaceService';
import type { ICreateWorkspaceFormData } from '../../components/createWorkspaceForm';
import { WorkspaceWizard } from '../../components/workspaceWizard';
import { WorkspaceDialogId } from '../../constants/workspaceDialogId';
import type { WorkspaceWizardStep } from '../../constants/workspaceWizardStep';
import type { IPublishWorkspaceDialogParams } from '../../dialogs/publishWorkspaceDialog';
import { workspaceEditPageUtils } from './workspaceEditPageUtils';

export interface IWorkspaceEditPageClientProps {
    /**
     * ID of the workspace to edit.
     */
    workspaceId: string;
    /**
     * Step the wizard opens on, the first one when not set.
     */
    initialStep?: WorkspaceWizardStep;
}

/**
 * Edit-workspace wizard, filled in from the stored workspace, which `WorkspaceGate` has loaded before this renders.
 */
export const WorkspaceEditPageClient: React.FC<
    IWorkspaceEditPageClientProps
> = (props) => {
    const { workspaceId, initialStep } = props;

    const { open } = useDialogContext();

    const { data: workspace } = useWorkspace({
        urlParams: { id: workspaceId },
    });

    // Narrows the type only; the gate above has already resolved the workspace.
    if (workspace == null) {
        return null;
    }

    const handleSubmit = (values: ICreateWorkspaceFormData) => {
        const params: IPublishWorkspaceDialogParams = { values, workspaceId };
        open(WorkspaceDialogId.PUBLISH_WORKSPACE, { params });
    };

    return (
        <Page.Main fullWidth={true}>
            <WorkspaceWizard
                analyticsFlow="edit_workspace"
                defaultValues={workspaceEditPageUtils.buildFormValues(
                    workspace,
                )}
                initialActiveStep={initialStep}
                onSubmit={handleSubmit}
                translationNamespace="app.workspace.workspaceEditPage"
            />
        </Page.Main>
    );
};
