import dynamic from 'next/dynamic';

export const MpcCreateWorkspaceDialog = dynamic(() =>
    import('./mpcCreateWorkspaceDialog').then(
        (mod) => mod.MpcCreateWorkspaceDialog,
    ),
);

export type {
    IMpcCreateWorkspaceDialogParams,
    IMpcCreateWorkspaceDialogProps,
} from './mpcCreateWorkspaceDialog';
