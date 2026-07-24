import type { UseQueryReturnType } from 'wagmi/query';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import type { TransactionStatusState } from '../transactionStatus';

// Known low-level errors mapped to a specific, actionable step error label. Message-substring
// matching is intentional: viem surfaces the node's RPC details (e.g. "Details: eth_sendRawTransaction:
// replacement transaction underpriced") inside the error message. Extend by appending patterns.
const knownErrorLabels: Array<{ pattern: string; labelKey: string }> = [
    {
        pattern: 'replacement transaction underpriced',
        labelKey: 'app.shared.transactionDialog.error.replacementUnderpriced',
    },
];

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

    /**
     * Returns the translation key of a specific error label for known transaction errors, or
     * undefined so the caller falls back to the step's generic error label.
     */
    getTransactionErrorLabel = (error: unknown): string | undefined => {
        if (!(error instanceof Error)) {
            return undefined;
        }
        const message = error.message.toLowerCase();

        return knownErrorLabels.find(({ pattern }) => message.includes(pattern))
            ?.labelKey;
    };

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
