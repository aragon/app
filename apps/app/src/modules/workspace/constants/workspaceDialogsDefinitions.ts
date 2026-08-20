import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { CreateWorkspaceDialog } from '../dialogs/createWorkspaceDialog';
import { WorkspaceDialogId } from './workspaceDialogId';

export const workspaceDialogsDefinitions: Record<
    WorkspaceDialogId,
    IDialogComponentDefinitions
> = {
    [WorkspaceDialogId.CREATE_WORKSPACE]: {
        Component: CreateWorkspaceDialog,
        // The creator of the workspace is the connected wallet, the dialog is meaningless without it.
        requiresWallet: true,
    },
};
