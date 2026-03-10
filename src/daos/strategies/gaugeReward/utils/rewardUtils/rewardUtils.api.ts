import type { IRewardDistributionOwner } from '@/plugins/gaugeVoterPlugin/api/gaugeVoterService';

export interface IToRewardJsonParams {
    /**
     * List of owners with their pre-computed reward amounts from the reward distribution API.
     */
    owners: IRewardDistributionOwner[];
}

export interface IRewardJsonEntry {
    /**
     * Address of the user receiving the reward.
     */
    address: string;
    /**
     * Reward amount in wei.
     */
    amount: string;
}

/**
 * List of owner address and reward amount pairs (in wei).
 */
export type IRewardJson = IRewardJsonEntry[];
