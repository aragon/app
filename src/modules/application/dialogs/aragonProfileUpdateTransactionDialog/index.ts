import dynamic from 'next/dynamic';

export const AragonProfileUpdateTransactionDialog = dynamic(() =>
    import('./aragonProfileUpdateTransactionDialog').then(
        (mod) => mod.AragonProfileUpdateTransactionDialog,
    ),
);

export type {
    IAragonProfileUpdateTransactionDialogParams,
    IAragonProfileUpdateTransactionDialogProps,
} from './aragonProfileUpdateTransactionDialog';
