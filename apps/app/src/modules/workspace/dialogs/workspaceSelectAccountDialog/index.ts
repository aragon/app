import dynamic from 'next/dynamic';

export const WorkspaceSelectAccountDialog = dynamic(() =>
    import('./workspaceSelectAccountDialog').then(
        (mod) => mod.WorkspaceSelectAccountDialog,
    ),
);
export type {
    IWorkspaceSelectAccountDialogParams,
    IWorkspaceSelectAccountDialogProps,
} from './workspaceSelectAccountDialog';
