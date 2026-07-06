import { useSyncExternalStore } from 'react';
import {
    type IPendingTransactionState,
    pendingTransactionManager,
} from '@/shared/utils/pendingTransactionManager';

/**
 * Subscribes to the manager for one action identity, re-rendering on its wallet-state changes.
 * Returns `undefined` when there is no record for the identity (or no identity yet).
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
