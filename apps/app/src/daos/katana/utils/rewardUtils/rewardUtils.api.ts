import type {
    IGaugeRewardDistributionEntry,
    IRewardDistributionOwner,
} from '@/plugins/gaugeVoterPlugin/api/gaugeVoterService';

export interface IToRewardJsonParams {
    /**
     * List of owners with their pre-computed reward amounts from the reward distribution API.
     */
    owners: IRewardDistributionOwner[];
}

export interface IToGaugeRewardJsonParams {
    /**
     * List of gauges with their pre-computed reward amounts from the
     * per-gauge reward distribution API.
     */
    gauges: IGaugeRewardDistributionEntry[];
}

export interface IRewardJsonEntry {
    /**
     * Address receiving the reward (owner or gauge contract).
     */
    address: string;
    /**
     * Reward amount in wei.
     */
    amount: string;
}

/**
 * List of address and reward amount pairs (in wei).
 */
export type IRewardJson = IRewardJsonEntry[];
