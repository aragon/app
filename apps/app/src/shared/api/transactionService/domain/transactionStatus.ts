export interface ITransactionStatus {
    /**
     * Flag to indicate if the backend has processed the transaction.
     */
    isProcessed: boolean;
    /**
     * Proposal slug if the transaction is a proposal.
     */
    slug?: string;
}
