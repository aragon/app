import { useQuery } from '@tanstack/react-query';
import type {
    QueryOptions,
    SharedQueryOptions,
} from '@/shared/types/queryOptions';
import type { ITokenRewardDistribution } from '../../domain';
import { tokenRewardService } from '../../tokenRewardService';
import type { IGetTokenRewardDistributionParams } from '../../tokenRewardService.api';
import { tokenRewardServiceKeys } from '../../tokenRewardServiceKeys';

export const tokenRewardDistributionOptions = (
    params: IGetTokenRewardDistributionParams,
    options?: QueryOptions<ITokenRewardDistribution>,
): SharedQueryOptions<ITokenRewardDistribution> => ({
    queryKey: tokenRewardServiceKeys.rewardDistribution(params),
    queryFn: () => tokenRewardService.getRewardDistribution(params),
    ...options,
});

export const useTokenRewardDistribution = (
    params: IGetTokenRewardDistributionParams,
    options?: QueryOptions<ITokenRewardDistribution>,
) => useQuery(tokenRewardDistributionOptions(params, options));
