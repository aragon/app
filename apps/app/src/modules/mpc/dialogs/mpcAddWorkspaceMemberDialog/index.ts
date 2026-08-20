import dynamic from 'next/dynamic';

export const MpcAddWorkspaceMemberDialog = dynamic(() =>
    import('./mpcAddWorkspaceMemberDialog').then(
        (mod) => mod.MpcAddWorkspaceMemberDialog,
    ),
);

export type {
    IMpcAddWorkspaceMemberDialogParams,
    IMpcAddWorkspaceMemberDialogProps,
} from './mpcAddWorkspaceMemberDialog';
