import type { ISafeConfirmation } from './safeConfirmation';

export interface ISafeMultisigTransaction {
    /**
     * Nonce the transaction will consume. Safe nonces are strictly sequential, so a transaction
     * is only live while `nonce >= ISafeInfo.nonce`.
     */
    nonce: number;
    /**
     * Hash identifying the transaction within the Safe.
     */
    safeTxHash: string;
    /**
     * Address that proposed the transaction.
     */
    from: string;
    /**
     * Target address of the transaction.
     */
    to: string;
    /**
     * Native value transferred by the transaction, as a decimal string.
     */
    value: string;
    /**
     * Calldata of the transaction, or null for a plain value transfer.
     */
    data: string | null;
    /**
     * Call type: 0 for `CALL`, 1 for `DELEGATECALL`.
     */
    operation: number;
    /**
     * Owner confirmations collected so far.
     */
    confirmations: ISafeConfirmation[];
    /**
     * Confirmations required for this specific transaction, captured when it was proposed.
     */
    confirmationsRequired: number;
    /**
     * Packed signature blob. Null until the transaction is executed — pending transactions expose
     * `confirmations` instead.
     */
    signatures: string | null;
    /**
     * Whether the transaction has been executed onchain.
     */
    isExecuted: boolean;
    /**
     * ISO date the transaction was submitted.
     */
    submissionDate: string;
}
