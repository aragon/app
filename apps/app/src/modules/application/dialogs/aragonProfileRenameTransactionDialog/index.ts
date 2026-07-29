import dynamic from 'next/dynamic';

export const AragonProfileRenameTransactionDialog = dynamic(() =>
    import('./aragonProfileRenameTransactionDialog').then(
        (mod) => mod.AragonProfileRenameTransactionDialog,
    ),
);

export type {
    IAragonProfileRecords,
    IAragonProfileRenameTransactionDialogParams,
    IAragonProfileRenameTransactionDialogProps,
} from './aragonProfileRenameTransactionDialog';
