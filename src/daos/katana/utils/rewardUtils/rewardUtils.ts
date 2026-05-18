import type {
    IRewardJson,
    IToGaugeRewardJsonParams,
    IToRewardJsonParams,
} from './rewardUtils.api';

class RewardUtils {
    /**
     * Converts a per-owner reward distribution API response to a downloadable JSON.
     *
     * @example
     * toRewardJson({ owners: [{ owner: '0xabc', rewardAmount: '500', ... }] })
     * -> [{ address: '0xabc', amount: '500' }]
     */
    toRewardJson = (params: IToRewardJsonParams): IRewardJson => {
        const { owners } = params;

        return owners.map((owner) => ({
            address: owner.owner,
            amount: owner.rewardAmount,
        }));
    };

    /**
     * Converts a per-gauge reward distribution API response to a downloadable JSON.
     *
     * @example
     * toGaugeRewardJson({ gauges: [{ gauge: '0xg1', rewardAmount: '500', ... }] })
     * -> [{ address: '0xg1', amount: '500' }]
     */
    toGaugeRewardJson = (params: IToGaugeRewardJsonParams): IRewardJson => {
        const { gauges } = params;

        return gauges.map((entry) => ({
            address: entry.gauge,
            amount: entry.rewardAmount,
        }));
    };
}

export const rewardUtils = new RewardUtils();
