import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { PublishWorkspaceDialog } from '../dialogs/publishWorkspaceDialog';
import { WorkspaceAddAccountsDialog } from '../dialogs/workspaceAddAccountsDialog';
import { WorkspaceCreateAccountDialog } from '../dialogs/workspaceCreateAccountDialog';
import { WorkspaceEditDetailsDialog } from '../dialogs/workspaceEditDetailsDialog';
import { WorkspaceSelectAccountDialog } from '../dialogs/workspaceSelectAccountDialog';
import { WorkspaceWelcomeDialog } from '../dialogs/workspaceWelcomeDialog';
import { WorkspaceDialogId } from './workspaceDialogId';

export const workspaceDialogsDefinitions: Record<
    WorkspaceDialogId,
    IDialogComponentDefinitions
> = {
    // Opened through `useWorkspaceAddAccountsDialog`, which asks for a wallet first: the suggestions are the wallet's.
    [WorkspaceDialogId.ADD_ACCOUNTS]: {
        Component: WorkspaceAddAccountsDialog,
        requiresWallet: true,
    },
    // Opened through `useWorkspaceCreateAccountDialog`, which asks for a wallet first: the signers start with it, and the
    // stacked deploy dialog goes with it on disconnect.
    [WorkspaceDialogId.CREATE_ACCOUNT]: {
        Component: WorkspaceCreateAccountDialog,
        size: 'lg',
        requiresWallet: true,
    },
    // Not `requiresWallet`: workspaces are stored locally.
    [WorkspaceDialogId.EDIT_DETAILS]: {
        Component: WorkspaceEditDetailsDialog,
    },
    // Not `requiresWallet`: workspaces are stored locally (see `createWorkspace.md` → Ownership).
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
    // Not `requiresWallet`: the dialog only greets and closes, nothing it does needs a connected wallet.
    // `lg` (640px) keeps each feature description on one line, as the artboard does.
    [WorkspaceDialogId.WELCOME]: {
        Component: WorkspaceWelcomeDialog,
        size: 'lg',
    },
};
