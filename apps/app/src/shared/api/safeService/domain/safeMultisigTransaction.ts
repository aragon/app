import type { ISafeConfirmation } from './safeConfirmation';
import { isSafeConfirmation } from './safeConfirmation';
import { isRecord, isUnsignedIntegerString } from './safeDomainUtils';

export interface ISafeMultisigTransaction {
    /**
     * Decimal-string nonce the transaction will consume. Safe nonces are strictly sequential, so
     * a transaction is only live while `BigInt(nonce) >= BigInt(ISafeInfo.nonce)`.
     */
    nonce: string;
    /**
     * Hash identifying the transaction within the Safe.
     */
    safeTxHash: string;
    /**
     * Address that proposed the transaction.
     */
    from: string | null;
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
     * Whether execution succeeded, or null while the transaction has not executed. A failed
     * execution still consumes the nonce.
     */
    isSuccessful: boolean | null;
    /**
     * ISO date the transaction was submitted.
     */
    submissionDate: string;
}

export const isSafeMultisigTransaction = (
    value: unknown,
): value is ISafeMultisigTransaction =>
    isRecord(value) &&
    isUnsignedIntegerString(value.nonce) &&
    typeof value.safeTxHash === 'string' &&
    (typeof value.from === 'string' || value.from === null) &&
    typeof value.to === 'string' &&
    typeof value.value === 'string' &&
    (typeof value.data === 'string' || value.data === null) &&
    (value.operation === 0 || value.operation === 1) &&
    Array.isArray(value.confirmations) &&
    value.confirmations.every(isSafeConfirmation) &&
    typeof value.confirmationsRequired === 'number' &&
    Number.isInteger(value.confirmationsRequired) &&
    value.confirmationsRequired > 0 &&
    (typeof value.signatures === 'string' || value.signatures === null) &&
    typeof value.isExecuted === 'boolean' &&
    (typeof value.isSuccessful === 'boolean' || value.isSuccessful === null) &&
    typeof value.submissionDate === 'string';
