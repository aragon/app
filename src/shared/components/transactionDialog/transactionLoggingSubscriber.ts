import {
    type PendingTransactionListener,
    PendingTransactionStatus,
    pendingTransactionManager,
} from '@/shared/utils/pendingTransactionManager';
import { transactionDialogUtils } from './transactionDialogUtils';

// Logs each FAILED send exactly once via the manager's change stream — independent of the dialog, so
// a wallet rejection still gets reported even when the dialog has been closed, and step navigation in
// an open dialog can no longer re-log it. Wallet rejections are filtered by monitorTransactionError.
// Exposed as a factory so the behaviour can be unit-tested without the manager or the init guard.
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
