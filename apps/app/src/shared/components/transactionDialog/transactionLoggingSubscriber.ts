import {
    type PendingTransactionListener,
    PendingTransactionStatus,
    pendingTransactionManager,
} from '@/shared/utils/pendingTransactionManager';
import { TransactionDialogStep } from './transactionDialog.api';
import { transactionDialogUtils } from './transactionDialogUtils';

// Logs each FAILED send once, independent of the dialog so a rejection is reported even when it is
// closed. Wallet rejections are filtered by monitorTransactionError. A factory, so it is testable.
export const createTransactionLogger = (): PendingTransactionListener => {
    const loggedIntents = new Set<string>();

    return (intentId, state) => {
        if (intentId == null) {
            return;
        }
        if (state?.status === PendingTransactionStatus.FAILED) {
            if (!loggedIntents.has(intentId)) {
                loggedIntents.add(intentId);
                transactionDialogUtils.monitorTransactionError(state.error, {
                    intentId,
                    stepId: TransactionDialogStep.APPROVE,
                });
            }
        } else {
            // A later transition (retry -> PENDING, or cleared) lets a future failure log again.
            loggedIntents.delete(intentId);
        }
    };
};

let initialized = false;

export const initTransactionLogging = (): void => {
    if (initialized) {
        return;
    }
    initialized = true;
    pendingTransactionManager.subscribe(createTransactionLogger());
};
