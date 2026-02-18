import type { IRewardJson, IToRewardJsonParams } from './rewardUtils.api';

class RewardUtils {
    /**
     * Converts a reward distribution API response to a downloadable JSON map of
     * owner address → reward amount in wei.
     *
     * For each owner: `rewardAmt = floor(totalAmount * shareBps / 10_000)`.
     * @example
     * toRewardJson({ owners: [{ owner: '0xabc', shareBps: 5000, ... }], totalAmount: 1000n })
     * -> { '0xabc': '500' }
     */
    toRewardJson = (params: IToRewardJsonParams): IRewardJson => {
        const { owners, totalAmount } = params;

        return Object.fromEntries(
            owners.map((owner) => [
                owner.owner,
                this.computeOwnerReward(totalAmount, owner.shareBps).toString(),
            ]),
        );
    };

    private computeOwnerReward = (
        totalAmount: bigint,
        shareBps: number,
    ): bigint => (totalAmount * BigInt(shareBps)) / BigInt(10_000);
}

export const rewardUtils = new RewardUtils();
