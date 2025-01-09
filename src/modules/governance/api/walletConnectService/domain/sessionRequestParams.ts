export interface ISessionRequestSendTransactionParams {
    /**
     * Address sending the transaction.
     */
    from: string;
    /**
     * Target of the transaction.
     */
    to: string;
    /**
     * Value of the transaction.
     */
    value: string;
    /**
     * Data of the transaction.
     */
    data: string;
}

// Parameters of session requests
export interface ISessionRequestParams {
    eth_sendTransaction: ISessionRequestSendTransactionParams[];
}
