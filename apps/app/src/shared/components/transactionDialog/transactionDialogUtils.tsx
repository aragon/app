import type { UseQueryReturnType } from 'wagmi/query';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import type { TransactionStatusState } from '../transactionStatus';

export class TransactionDialogUtils {
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
        // Always report — including expected wallet behaviour (rejection, insufficient
        // balance, …). monitoringUtils.beforeSend tags those `noise_class=expected` so
        // they stay out of alerts but remain searchable for a future investigation.
        monitoringUtils.logError(error, { context });
    };
}

export const transactionDialogUtils = new TransactionDialogUtils();
