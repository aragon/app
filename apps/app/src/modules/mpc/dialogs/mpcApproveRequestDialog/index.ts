import dynamic from 'next/dynamic';

export const MpcApproveRequestDialog = dynamic(() =>
    import('./mpcApproveRequestDialog').then(
        (mod) => mod.MpcApproveRequestDialog,
    ),
);

export type {
    IMpcApproveRequestDialogParams,
    IMpcApproveRequestDialogProps,
} from './mpcApproveRequestDialog';
