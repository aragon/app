import dynamic from 'next/dynamic';

export const AragonProfileRenameTransactionDialog = dynamic(() =>
    import('./aragonProfileRenameTransactionDialog').then(
        (mod) => mod.AragonProfileRenameTransactionDialog,
    ),
);

export type {
    IAragonProfileRenameTransactionDialogParams,
    IAragonProfileRenameTransactionDialogProps,
} from './aragonProfileRenameTransactionDialog';
