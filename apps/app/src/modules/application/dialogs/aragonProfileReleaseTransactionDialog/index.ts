import dynamic from 'next/dynamic';

export const AragonProfileReleaseTransactionDialog = dynamic(() =>
    import('./aragonProfileReleaseTransactionDialog').then(
        (mod) => mod.AragonProfileReleaseTransactionDialog,
    ),
);

export type {
    IAragonProfileReleaseTransactionDialogParams,
    IAragonProfileReleaseTransactionDialogProps,
} from './aragonProfileReleaseTransactionDialog';
