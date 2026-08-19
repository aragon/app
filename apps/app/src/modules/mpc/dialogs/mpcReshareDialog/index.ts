import dynamic from 'next/dynamic';

export const MpcReshareDialog = dynamic(() =>
    import('./mpcReshareDialog').then((mod) => mod.MpcReshareDialog),
);

export type {
    IMpcReshareDialogParams,
    IMpcReshareDialogProps,
} from './mpcReshareDialog';
