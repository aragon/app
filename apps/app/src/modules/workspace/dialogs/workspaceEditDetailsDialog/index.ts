import dynamic from 'next/dynamic';

export const WorkspaceEditDetailsDialog = dynamic(() =>
    import('./workspaceEditDetailsDialog').then(
        (mod) => mod.WorkspaceEditDetailsDialog,
    ),
);

export type {
    IWorkspaceEditDetailsDialogParams,
    IWorkspaceEditDetailsDialogProps,
} from './workspaceEditDetailsDialog';
