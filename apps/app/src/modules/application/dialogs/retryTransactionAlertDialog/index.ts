import dynamic from 'next/dynamic';

export const RetryTransactionAlertDialog = dynamic(() =>
    import('./retryTransactionAlertDialog').then(
        (mod) => mod.RetryTransactionAlertDialog,
    ),
);
export type {
    IRetryTransactionAlertDialogParams,
    IRetryTransactionAlertDialogProps,
} from './retryTransactionAlertDialog.api';
