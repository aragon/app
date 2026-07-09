import type { IGetTokenRewardDistributionParams } from './tokenRewardService.api';

export enum TokenRewardServiceKey {
    TOKEN_REWARD_DISTRIBUTION = 'TOKEN_REWARD_DISTRIBUTION',
}

export const tokenRewardServiceKeys = {
    rewardDistribution: (params: IGetTokenRewardDistributionParams) => [
        TokenRewardServiceKey.TOKEN_REWARD_DISTRIBUTION,
        params,
    ],
};
