/**
 * Reward entry for a single gauge in a gauge-based reward distribution.
 */
export interface IGaugeRewardDistributionEntry {
    /**
     * Address of the gauge contract.
     */
    gauge: string;
    /**
     * Voting power directed at the gauge for the epoch.
     */
    votingPower: string;
    /**
     * Reward amount allocated to the gauge.
     */
    rewardAmount: string;
}

/**
 * Reward distribution data from the backend
 * /v2/gauge/gaugeRewards/:pluginAddress/:network/:epochId endpoint.
 *
 * Splits a total reward amount across gauges proportionally to their
 * voting power share in a closed epoch.
 */
export interface IGaugeRewardDistribution {
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
     * Total voting power across all gauges for this epoch.
     */
    totalVotingPower: string;
    /**
     * Total reward amount distributed.
     */
    rewardTotalAmount: string;
    /**
     * Per-gauge reward entries.
     */
    gaugeRewards: IGaugeRewardDistributionEntry[];
}
