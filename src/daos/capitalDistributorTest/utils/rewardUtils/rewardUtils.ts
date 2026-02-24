import type { IRewardJson, IToRewardJsonParams } from './rewardUtils.api';

class RewardUtils {
    /**
     * Converts a reward distribution API response to a downloadable JSON map of
     * owner address → reward amount in wei.
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
}

export const rewardUtils = new RewardUtils();
