import dynamic from 'next/dynamic';

export const MpcSignRequestDialog = dynamic(() =>
    import('./mpcSignRequestDialog').then((mod) => mod.MpcSignRequestDialog),
);

export type {
    IMpcSignRequestDialogParams,
    IMpcSignRequestDialogProps,
} from './mpcSignRequestDialog';
