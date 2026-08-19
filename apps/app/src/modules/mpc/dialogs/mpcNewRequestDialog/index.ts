import dynamic from 'next/dynamic';

export const MpcNewRequestDialog = dynamic(() =>
    import('./mpcNewRequestDialog').then((mod) => mod.MpcNewRequestDialog),
);

export type {
    IMpcNewRequestDialogParams,
    IMpcNewRequestDialogProps,
} from './mpcNewRequestDialog';
