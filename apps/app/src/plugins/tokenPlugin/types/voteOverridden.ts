/**
 * Set on a delegate's vote when one or more of their delegators reclaimed their delegated voting power through an
 * override vote. The vote's votingPower and voteOption then hold the remaining countable values.
 */
export interface IVoteOverridden {
    /**
     * Defines if the vote has been overridden.
     */
    status: boolean;
    /**
     * Hash of the last override transaction.
     */
    transactionHash: string;
    /**
     * Block number of the last override.
     */
    blockNumber: number;
    /**
     * Timestamp of the block of the last override.
     */
    blockTimestamp: number;
    /**
     * Index of the override transaction inside the block.
     */
    transactionIndex?: number;
    /**
     * Index of the override log inside the block.
     */
    logIndex?: number;
}
