import type { Hex } from 'viem';

export interface IGaugeVote {
    /**
     * The weight for this vote allocation (relative weight).
     */
    weight: bigint;
    /**
     * The gauge address to vote for.
     */
    gauge: Hex;
}

export interface IBuildVoteTransactionParams {
    /**
     * Array of vote allocations with their weights.
     */
    votes: IGaugeVote[];
    /**
     * The address of the gauge voter plugin.
     */
    pluginAddress: string;
}
