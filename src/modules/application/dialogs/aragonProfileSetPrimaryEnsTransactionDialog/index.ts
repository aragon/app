import dynamic from 'next/dynamic';

export const AragonProfileSetPrimaryEnsTransactionDialog = dynamic(() =>
    import('./aragonProfileSetPrimaryEnsTransactionDialog').then(
        (mod) => mod.AragonProfileSetPrimaryEnsTransactionDialog,
    ),
);

export type {
    IAragonProfileSetPrimaryEnsTransactionDialogParams,
    IAragonProfileSetPrimaryEnsTransactionDialogProps,
} from './aragonProfileSetPrimaryEnsTransactionDialog';
