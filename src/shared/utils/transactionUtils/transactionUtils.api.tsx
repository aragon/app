import type { Hex } from 'viem';

export interface ITransactionToMulticallRequestParams {
    /**
     * Transaction to be converted to a multicall transaction.
     */
    transaction: Omit<ITransactionRequest, 'value'>;
    /**
     * If false, the entire call will revert if the call fails.
     * @default false
     */
    allowFailure?: boolean;
}

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
