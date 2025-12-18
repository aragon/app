import type { UseQueryReturnType } from 'wagmi/query';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import type { TransactionStatusState } from '../transactionStatus';

export class TransactionDialogUtils {
    private readonly ignoreErrors = [
        'User rejected the request', // Error caused by user rejecting the transaction on their wallet
    ];

    queryToStepState = (status: UseQueryReturnType['status'], fetchStatus: UseQueryReturnType['fetchStatus']): TransactionStatusState =>
        status === 'pending' ? (fetchStatus === 'fetching' ? 'pending' : 'idle') : status;

    monitorTransactionError = (error: unknown, context?: Record<string, unknown>) => {
        if (this.shouldIgnoreError(error)) {
            return;
        }

        monitoringUtils.logError(error, { context });
    };

    private readonly shouldIgnoreError = (error: unknown) =>
        error instanceof Error && this.ignoreErrors.some((ignoreError) => error.message.includes(ignoreError));
}

export const transactionDialogUtils = new TransactionDialogUtils();
