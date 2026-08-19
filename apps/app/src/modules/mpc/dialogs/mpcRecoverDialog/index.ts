import dynamic from 'next/dynamic';

export const MpcRecoverDialog = dynamic(() =>
    import('./mpcRecoverDialog').then((mod) => mod.MpcRecoverDialog),
);

export type {
    IMpcRecoverDialogParams,
    IMpcRecoverDialogProps,
} from './mpcRecoverDialog';
