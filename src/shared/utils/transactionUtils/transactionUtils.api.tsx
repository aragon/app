import type { Hex } from 'viem';

export interface IMulticallRequest {
    /**
     * Target of the transaction.
     */
    target: Hex;
    /**
     * Data of the transaction.
     */
    callData: Hex;
    /**
     * If false, the entire call will revert if the call fails.
     */
    allowFailure: boolean;
}

export interface ITransactionRequest {
    /**
     * Target of the transaction.
     */
    to: Hex;
    /**
     * Data of the transaction.
     */
    data: Hex;
    /**
     * Value of the transaction
     */
    value?: bigint;
}
