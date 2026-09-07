import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { PublishWorkspaceDialog } from '../dialogs/publishWorkspaceDialog';
import { WorkspaceDialogId } from './workspaceDialogId';

export const workspaceDialogsDefinitions: Record<
    WorkspaceDialogId,
    IDialogComponentDefinitions
> = {
    [WorkspaceDialogId.PUBLISH_WORKSPACE]: {
        Component: PublishWorkspaceDialog,
        requiresWallet: true,
    },
};
