/**
 * Reward entry for a single owner in a reward distribution.
 */
export interface IRewardDistributionOwner {
    /**
     * Address of the owner.
     */
    owner: string;
    /**
     * Voting power of the owner for the epoch.
     */
    votingPower: string;
    /**
     * Reward amount allocated to the owner.
     */
    rewardAmount: string;
    /**
     * Token IDs held by the owner that contributed to their voting power.
     */
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
}
