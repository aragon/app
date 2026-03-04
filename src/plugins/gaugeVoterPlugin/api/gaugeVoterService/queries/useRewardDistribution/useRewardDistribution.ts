import { useQuery } from '@tanstack/react-query';
import type {
    QueryOptions,
    SharedQueryOptions,
} from '@/shared/types/queryOptions';
import type { IRewardDistribution } from '../../domain';
import { gaugeVoterService } from '../../gaugeVoterService';
import type { IGetRewardDistributionParams } from '../../gaugeVoterService.api';
import { gaugeVoterServiceKeys } from '../../gaugeVoterServiceKeys';

export const rewardDistributionOptions = (
    params: IGetRewardDistributionParams,
    options?: QueryOptions<IRewardDistribution>,
): SharedQueryOptions<IRewardDistribution> => ({
    queryKey: gaugeVoterServiceKeys.rewardDistribution(params),
    queryFn: () => gaugeVoterService.getRewardDistribution(params),
    ...options,
});

export const useRewardDistribution = (
    params: IGetRewardDistributionParams,
    options?: QueryOptions<IRewardDistribution>,
) => useQuery(rewardDistributionOptions(params, options));
