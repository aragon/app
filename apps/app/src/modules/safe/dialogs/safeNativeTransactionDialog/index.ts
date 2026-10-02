import dynamic from 'next/dynamic';

export const SafeNativeTransactionDialog = dynamic(() =>
    import('./safeNativeTransactionDialog').then(
        (mod) => mod.SafeNativeTransactionDialog,
    ),
);
export type {
    ISafeNativeTransactionDialogParams,
    ISafeNativeTransactionDialogProps,
} from './safeNativeTransactionDialog.api';
