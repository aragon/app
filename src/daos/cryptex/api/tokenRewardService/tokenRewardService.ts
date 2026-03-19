import { AragonBackendService } from '@/shared/api/aragonBackendService';
import type { ITokenRewardDistribution } from './domain';
import type { IGetTokenRewardDistributionParams } from './tokenRewardService.api';

class TokenRewardService extends AragonBackendService {
    private urls = {
        rewardDistribution: '/v2/tokens/rewards/:pluginAddress/:network',
    };

    /**
     * Computes the token voting reward distribution for a given plugin and lookback period.
     * Returns per-staker reward entries based on governance participation.
     */
    getRewardDistribution = async (
        params: IGetTokenRewardDistributionParams,
    ): Promise<ITokenRewardDistribution> => {
        const result = await this.request<ITokenRewardDistribution>(
            this.urls.rewardDistribution,
            params,
        );
        return result;
    };
}

export const tokenRewardService = new TokenRewardService();
