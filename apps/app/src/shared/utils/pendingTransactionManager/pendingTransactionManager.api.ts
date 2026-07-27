import type { Hex } from 'viem';

// Lifecycle: PENDING → SUBMITTED → (cleared once the receipt confirms); PENDING → FAILED.
// Only SUBMITTED records are persisted/resumable — a PENDING send has no hash and its live wallet
// promise cannot survive a reload.
export enum PendingTransactionStatus {
    // Handed to the wallet; awaiting sign or reject.
    PENDING = 'PENDING',
    // Signed and broadcast — a hash is available.
    SUBMITTED = 'SUBMITTED',
    // User cancelled or a dispatch error (cancellations are filtered from logging downstream).
    FAILED = 'FAILED',
}

// `type` and `scope` narrow duplicate detection (see IPendingTransactionMeta). Both are opaque to the
// manager and just travel with the state. `submittedAt` (broadcast timestamp) and `chainId` (broadcast
// chain) are persisted with SUBMITTED records so a resumed consumer can tell how long the transaction
// has been unconfirmed and reconciliation can look the receipt up on the right chain.
export interface IPendingTransactionState {
    status: PendingTransactionStatus;
    hash?: Hex;
    submittedAt?: number;
    chainId?: number;
    error?: unknown;
    type?: string;
    scope?: string;
}

// Optional metadata attached to a send: `type` (e.g. proposal creation) and `scope` (e.g. a DAO + plugin
// key) narrow duplicate detection. Kept across every status transition and the persisted mirror.
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
