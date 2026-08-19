import dynamic from 'next/dynamic';

export const MpcExportKeyDialog = dynamic(() =>
    import('./mpcExportKeyDialog').then((mod) => mod.MpcExportKeyDialog),
);

export type {
    IMpcExportKeyDialogParams,
    IMpcExportKeyDialogProps,
} from './mpcExportKeyDialog';
