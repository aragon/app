/**
 * Executable lifecycle of a live Safe transaction, combining confirmation count against the live
 * threshold with nonce position. Distinct from `SafeTransactionState`, which only answers whether a
 * transaction can ever execute again; this answers what the owner should do next.
 */
export enum SafeApprovalReadiness {
    /** Fewer current-owner confirmations than the live threshold. */
    AWAITING_APPROVALS = 'AWAITING_APPROVALS',
    /** Threshold reached and the transaction sits on the Safe's current nonce. */
    READY_TO_EXECUTE = 'READY_TO_EXECUTE',
    /** Threshold reached but an earlier nonce must execute first. */
    WAITING_FOR_NONCE = 'WAITING_FOR_NONCE',
    /** The nonce was consumed by another transaction — permanently unexecutable. */
    SUPERSEDED = 'SUPERSEDED',
    /** Executed onchain successfully. */
    EXECUTED_SUCCESS = 'EXECUTED_SUCCESS',
    /** Executed onchain but reverted; the nonce is still consumed. */
    EXECUTED_FAILURE = 'EXECUTED_FAILURE',
    /** Executed but the outcome is not yet reported. */
    EXECUTED_UNKNOWN = 'EXECUTED_UNKNOWN',
}
