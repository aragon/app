import dynamic from 'next/dynamic';

export const WorkspaceAddAccountsDialog = dynamic(() =>
    import('./workspaceAddAccountsDialog').then(
        (mod) => mod.WorkspaceAddAccountsDialog,
    ),
);

export type {
    IWorkspaceAddAccountsDialogParams,
    IWorkspaceAddAccountsDialogProps,
} from './workspaceAddAccountsDialog';
