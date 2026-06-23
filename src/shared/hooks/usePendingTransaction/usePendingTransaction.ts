import { useSyncExternalStore } from 'react';
import {
    type IPendingTransactionState,
    pendingTransactionManager,
} from '@/shared/utils/pendingTransactionManager';

/**
 * Subscribes to the pending-transaction manager for a given action identity. Re-renders the caller
 * whenever that action's wallet state changes — including after the dialog is closed and re-opened,
 * since it reads from the same module-level singleton. Returns `undefined` when there is no record
 * for the identity (or no identity yet).
 */
export const usePendingTransaction = (
    intentId?: string,
): IPendingTransactionState | undefined =>
    useSyncExternalStore(
        pendingTransactionManager.subscribe,
        () =>
            intentId == null
                ? undefined
                : pendingTransactionManager.get(intentId),
        () => undefined,
    );
