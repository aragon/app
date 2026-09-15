import dynamic from 'next/dynamic';

export const WorkspaceSelectProcessDialog = dynamic(() =>
    import('./workspaceSelectProcessDialog').then(
        (mod) => mod.WorkspaceSelectProcessDialog,
    ),
);
export type {
    IWorkspaceSelectProcessDialogParams,
    IWorkspaceSelectProcessDialogProps,
    IWorkspaceSelectProcessTarget,
} from './workspaceSelectProcessDialog';
