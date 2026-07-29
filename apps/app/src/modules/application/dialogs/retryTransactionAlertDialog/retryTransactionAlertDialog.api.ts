import type { IDialogComponentProps } from '@/shared/components/dialogProvider';

export interface IRetryTransactionAlertDialogParams {
    /**
     * "Retry transaction": supersede the long-unconfirmed transaction and re-send the action.
     */
    onRetry: () => void;
}

export interface IRetryTransactionAlertDialogProps
    extends IDialogComponentProps<IRetryTransactionAlertDialogParams> {}
