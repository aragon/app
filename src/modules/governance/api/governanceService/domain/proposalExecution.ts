export interface IProposalExecution {
    /**
     * Defines if the proposal has been executed or not. Defaults to false when the proposal is still active.
     */
    status: boolean;
    /**
     * Transaction hash set when the proposal has been executed.
     */
    transactionHash?: string;
    /**
     * Timestamp of the execution date of the proposal.
     */
    blockTimestamp?: number;
    /**
     * Block number of the execution date of the proposal.
     */
    blockNumber?: number;
}
