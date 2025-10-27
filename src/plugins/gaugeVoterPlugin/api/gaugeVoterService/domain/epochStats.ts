/**
 * Epoch-level metrics data from the backend /epochMetrics/:pluginAddress/:network endpoint.
 * This provides metadata about the current voting epoch for the gauge list.
 */
export interface IEpochMetrics {
    /**
     * Unique identifier of the epoch.
     */
    epochId: string;
    /**
     * Whether the current epoch is in voting period.
     */
    isVotingPeriod: boolean;
    /**
     * End time of the current epoch (Unix timestamp in milliseconds).
     */
    endTime: number;
    /**
     * Total votes cast across all gauges in the current epoch.
     */
    totalVotes: number;
    /**
     * Total voting power available in this epoch.
     */
    totalVotingPower: string;
}
