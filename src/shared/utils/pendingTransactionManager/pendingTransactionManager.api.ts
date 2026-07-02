import type { Hex } from 'viem';

export enum PendingTransactionStatus {
    // Handed to the wallet; awaiting sign or reject.
    PENDING = 'PENDING',
    // Signed and broadcast — a hash is available.
    SUBMITTED = 'SUBMITTED',
    // User cancelled or a dispatch error (cancellations are filtered from logging downstream).
    FAILED = 'FAILED',
}

// `type` and `scope` are opaque to the manager; they scope duplicate detection (see IPendingTransactionMeta).
export interface IPendingTransactionState {
    status: PendingTransactionStatus;
    hash?: Hex;
    error?: unknown;
    type?: string;
    scope?: string;
}

// Optional metadata attached to a send: `type` (e.g. proposal creation) and `scope` (e.g. a DAO + plugin
// key), kept so duplicate detection can be narrowed to the same kind of action in the same context.
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
