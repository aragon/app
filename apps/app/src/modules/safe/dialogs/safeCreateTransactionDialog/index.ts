import dynamic from 'next/dynamic';

export const SafeCreateTransactionDialog = dynamic(() =>
    import('./safeCreateTransactionDialog').then(
        (mod) => mod.SafeCreateTransactionDialog,
    ),
);
export type {
    ISafeCreateTransactionDialogParams,
    ISafeCreateTransactionDialogProps,
} from './safeCreateTransactionDialog.api';
