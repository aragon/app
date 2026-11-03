'use client';

import { useDialogContext } from '@/shared/components/dialogProvider';
import { Page } from '@/shared/components/page';
import {
    createWorkspaceFormDefaultValues,
    type ICreateWorkspaceFormData,
} from '../../components/createWorkspaceForm';
import { WorkspaceWizard } from '../../components/workspaceWizard';
import { WorkspaceDialogId } from '../../constants/workspaceDialogId';
import type { IPublishWorkspaceDialogParams } from '../../dialogs/publishWorkspaceDialog';

export interface ICreateWorkspacePageClientProps {}

export const CreateWorkspacePageClient: React.FC<
    ICreateWorkspacePageClientProps
> = () => {
    const { open } = useDialogContext();

    const handleSubmit = (values: ICreateWorkspaceFormData) => {
        const params: IPublishWorkspaceDialogParams = { values };
        open(WorkspaceDialogId.PUBLISH_WORKSPACE, { params });
    };

    return (
        <Page.Main fullWidth={true}>
            <WorkspaceWizard
                analyticsFlow="create_workspace"
                defaultValues={createWorkspaceFormDefaultValues}
                onSubmit={handleSubmit}
                translationNamespace="app.workspace.createWorkspacePage"
            />
        </Page.Main>
    );
};
