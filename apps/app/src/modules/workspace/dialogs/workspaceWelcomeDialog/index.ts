import dynamic from 'next/dynamic';

export const WorkspaceWelcomeDialog = dynamic(() =>
    import('./workspaceWelcomeDialog').then(
        (mod) => mod.WorkspaceWelcomeDialog,
    ),
);

export type { IWorkspaceWelcomeDialogProps } from './workspaceWelcomeDialog';
