import type { IRewardDistributionOwner } from '@/plugins/gaugeVoterPlugin/api/gaugeVoterService';

export interface IToRewardJsonParams {
    /**
     * List of owners with their share basis points from the reward distribution API.
     */
    owners: IRewardDistributionOwner[];
    /**
     * Total reward amount in wei to distribute across all owners.
     */
    totalAmount: bigint;
}

/**
 * Map of owner address to reward amount string (in wei).
 */
export type IRewardJson = Record<string, string>;
