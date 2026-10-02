import type { Hex } from 'viem';

// Lifecycle: PENDING → SUBMITTED → (cleared once the receipt confirms, unless caller-managed recovery
// context is present); PENDING → FAILED. Caller-managed PENDING recovery records represent an
// uncertain send with no hash and are acknowledged with an explicit `clear`.
// Only SUBMITTED records and caller-managed PENDING recovery records are persisted/resumable; a
// generic PENDING send has no hash and its live wallet promise cannot survive a reload.
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
// chain) are persisted with SUBMITTED records and uncertain PENDING recovery records so a resumed
// consumer can identify the action and use the right chain. `recovery` is caller-owned serializable
// context: records carrying it are retained until the caller acknowledges reconciliation with `clear`.
export interface IPendingTransactionState {
    status: PendingTransactionStatus;
    hash?: Hex;
    submittedAt?: number;
    chainId?: number;
    error?: unknown;
    type?: string;
    scope?: string;
    recovery?: Record<string, unknown>;
}

// Optional metadata attached to a send: `type` (e.g. proposal creation) and `scope` (e.g. a DAO + plugin
// key) narrow duplicate detection. Kept across every status transition and the persisted mirror.
// `recovery` opts a record into caller-managed reconciliation; PENDING recovery records specifically
// represent an uncertain send and must not be resumed by blindly submitting again.
export interface IPendingTransactionMeta {
    type?: string;
    scope?: string;
    recovery?: Record<string, unknown>;
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
