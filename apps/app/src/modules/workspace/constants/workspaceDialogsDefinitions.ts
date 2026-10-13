import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { PublishWorkspaceDialog } from '../dialogs/publishWorkspaceDialog';
import { WorkspaceSelectAccountDialog } from '../dialogs/workspaceSelectAccountDialog';
import { WorkspaceDialogId } from './workspaceDialogId';

export const workspaceDialogsDefinitions: Record<
    WorkspaceDialogId,
    IDialogComponentDefinitions
> = {
    // Not `requiresWallet`: workspaces are stored locally, so creating or updating one involves no wallet (see
    // `docs/projectDocs/createWorkspace.md` → Ownership).
    [WorkspaceDialogId.PUBLISH_WORKSPACE]: {
        Component: PublishWorkspaceDialog,
    },
    // Deliberately not `requiresWallet`: picking an account and a process comes before connecting, exactly as on
    // the DAO pages, where neither SELECT_PLUGIN nor PERMISSION_CHECK is flagged and `usePermissionCheckGuard`
    // prompts for the wallet after the selection. Flagging it makes `DialogRoot` render null and close the dialog
    // for every disconnected user, so the button would silently do nothing.
    [WorkspaceDialogId.SELECT_ACCOUNT]: {
        Component: WorkspaceSelectAccountDialog,
    },
};
