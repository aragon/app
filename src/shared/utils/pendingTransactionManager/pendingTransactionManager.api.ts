import type { Hex } from 'viem';

export enum PendingTransactionStatus {
    // Handed to the wallet; awaiting sign or reject.
    PENDING = 'PENDING',
    // Signed and broadcast — a hash is available.
    SUBMITTED = 'SUBMITTED',
    // User cancelled or a dispatch error (cancellations are filtered from logging downstream).
    FAILED = 'FAILED',
}

export interface IPendingTransactionState {
    status: PendingTransactionStatus;
    hash?: Hex;
    error?: unknown;
}

// Notified on every state change. `intentId`/`state` describe the change (`state` is undefined when
// the record was cleared); a no-arg listener (e.g. useSyncExternalStore) simply ignores them.
export type PendingTransactionListener = (
    intentId?: string,
    state?: IPendingTransactionState,
) => void;
