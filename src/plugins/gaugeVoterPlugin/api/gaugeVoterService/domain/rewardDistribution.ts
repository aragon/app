export interface IRewardDistributionInvariant {
    name: string;
    pass: boolean;
    detail: string;
    failures?: string[];
}

export interface IRewardDistributionOwner {
    owner: string;
    votingPower: string;
    shareBps: number;
    tokenIds: string[];
}

/**
 * Reward distribution data from the backend /v2/gauge/rewards/:pluginAddress/:network/:epochId endpoint.
 */
export interface IRewardDistribution {
    /**
     * Epoch ID.
     */
    epoch: number;
    /**
     * Address of the GaugeVoter plugin.
     */
    pluginAddress: string;
    /**
     * Network of the DAO.
     */
    network: string;
    /**
     * Total voting power across all owners for this epoch.
     */
    totalVotingPower: string;
    /**
     * Per-owner reward entries.
     */
    owners: IRewardDistributionOwner[];
    /**
     * Invariant check results for the distribution computation.
     */
    invariants: IRewardDistributionInvariant[];
}
