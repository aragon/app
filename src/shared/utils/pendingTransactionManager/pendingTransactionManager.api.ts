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
