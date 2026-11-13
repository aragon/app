/**
 * Liveness of a Safe transaction, derived from the Safe nonce rather than read from the service.
 * `isExecuted: false` is not "pending": a transaction below the Safe's current nonce can never
 * execute again, however many confirmations it collected.
 */
export enum SafeTransactionState {
    /** The nonce is still reachable, so the transaction can still be executed. */
    LIVE = 'LIVE',
    /** The nonce has been consumed by another transaction — permanently unexecutable. */
    SUPERSEDED = 'SUPERSEDED',
    /** The transaction has been executed onchain, successfully or not. */
    EXECUTED = 'EXECUTED',
}
