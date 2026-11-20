import dynamic from 'next/dynamic';

export const WorkspaceCreateAccountDialog = dynamic(() =>
    import('./workspaceCreateAccountDialog').then(
        (mod) => mod.WorkspaceCreateAccountDialog,
    ),
);

export type {
    IWorkspaceCreateAccountDialogParams,
    IWorkspaceCreateAccountDialogProps,
} from './workspaceCreateAccountDialog';
