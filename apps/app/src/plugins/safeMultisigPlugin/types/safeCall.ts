/**
 * Single call carried by a Safe transaction, either the transaction itself or one of the calls
 * unpacked from a MultiSend batch.
 */
export interface ISafeCall {
    /**
     * Target address of the call.
     */
    to: string;
    /**
     * Calldata of the call, or null for a plain value transfer.
     */
    data: string | null;
    /**
     * Call type: 0 for `CALL`, 1 for `DELEGATECALL`.
     */
    operation: number;
    /**
     * Native value transferred by the call.
     */
    value: bigint;
}
