import dynamic from 'next/dynamic';

export const SafeTransactionDialog = dynamic(() =>
    import('./safeTransactionDialog').then((mod) => mod.SafeTransactionDialog),
);
export type {
    ISafeTransactionDialogParams,
    ISafeTransactionDialogProps,
} from './safeTransactionDialog.api';
