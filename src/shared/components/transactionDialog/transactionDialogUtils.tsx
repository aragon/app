import type { UseQueryReturnType } from 'wagmi/query';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import type { TransactionStatusState } from '../transactionStatus';

export class TransactionDialogUtils {
    private ignoreErrors = [
        'User rejected the request', // Standard wallet rejection (MetaMask, WalletConnect, …)
        'Signing aborted by user', // Opera wallet rejection
        'User denied transaction signature', // Older wallet variants
    ];

    queryToStepState = (
        status: UseQueryReturnType['status'],
        fetchStatus: UseQueryReturnType['fetchStatus'],
    ): TransactionStatusState =>
        status === 'pending'
            ? fetchStatus === 'fetching'
                ? 'pending'
                : 'idle'
            : status;

    monitorTransactionError = (
        error: unknown,
        context?: Record<string, unknown>,
    ) => {
        if (this.shouldIgnoreError(error)) {
            return;
        }

        monitoringUtils.logError(error, { context });
    };

    private shouldIgnoreError = (error: unknown) =>
        error instanceof Error &&
        this.ignoreErrors.some((ignoreError) =>
            error.message.includes(ignoreError),
        );
}

export const transactionDialogUtils = new TransactionDialogUtils();
