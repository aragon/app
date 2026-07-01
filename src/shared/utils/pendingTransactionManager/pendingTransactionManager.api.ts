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
    /**
     * Optional transaction type, used to scope duplicate detection (e.g. warn only about another
     * in-flight proposal creation). Opaque to the manager.
     */
    type?: string;
    /**
     * Optional opaque scope (e.g. a DAO + plugin key) used to narrow duplicate detection to the same
     * context. Opaque to the manager.
     */
    scope?: string;
}

// Optional metadata attached to a send, kept so duplicate detection can be scoped by type and context.
export interface IPendingTransactionMeta {
    type?: string;
    scope?: string;
}

// Filter for querying active (PENDING/SUBMITTED) records; every provided field must match.
export interface IPendingTransactionFilter {
    type?: string;
    scope?: string;
    excludeIntentId?: string;
}

// Notified on every state change; `state` is undefined when the record was cleared.
export type PendingTransactionListener = (
    intentId?: string,
    state?: IPendingTransactionState,
) => void;
