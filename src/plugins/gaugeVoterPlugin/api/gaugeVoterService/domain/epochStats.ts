/**
 * Epoch-level metrics data from the backend /v2/gauge/epochMetrics/:pluginAddress/:network endpoint.
 * This provides metadata about the current voting epoch for the gauge list.
 */
export interface IEpochMetrics {
    /**
     * The gauge voter plugin address.
     */
    pluginAddress: string;
    /**
     * The network the plugin is deployed on.
     */
    network: string;
    /**
     * Unique identifier of the epoch.
     */
    epochId: string;
    /**
     * Total voting power available in this epoch (as string to handle large numbers).
     */
    totalVotingPower: string;
    /**
     * Whether the voting power hook is enabled for updates.
     */
    enableUpdateVotingPowerHook: boolean;
    /**
     * Start time of the current epoch (Unix timestamp in seconds).
     */
    currentEpochStart: number;
    /**
     * Start time of the voting period (Unix timestamp in seconds).
     */
    epochVoteStart: number;
    /**
     * End time of the voting period (Unix timestamp in seconds).
     */
    epochVoteEnd: number;
}
