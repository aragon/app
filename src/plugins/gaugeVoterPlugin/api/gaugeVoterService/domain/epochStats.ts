export interface IEpochStats {
    /**
     * Unique identifier of the epoch.
     */
    epochId: string;
    /**
     * Whether the current epoch is in voting period.
     */
    isVotingPeriod: boolean;
    /**
     * End time of the current epoch.
     */
    endTime: number;
    /**
     * Total votes in the current epoch.
     */
    totalVotes: number;
    /**
     * User's total voting power.
     */
    votingPower: number;
    /**
     * User's used voting power.
     */
    usedVotingPower: number;
}
