export interface IMemberMetrics {
    /**
     * The number of delegates that the member has received.
     */
    delegateReceivedCount: number;
    /**
     * The number of delegates that the member has issued.
     */
    delegateSentCount: number;
    /**
     * The number of proposals that the member has voted on.
     */
    voteCount: number;
    /**
     * The number of proposals that the member has created.
     */
    proposalCount: number;
}
