import { useQuery } from '@tanstack/react-query';
import type {
    QueryOptions,
    SharedQueryOptions,
} from '@/shared/types/queryOptions';
import type { IGaugeRewardDistribution } from '../../domain';
import { gaugeVoterService } from '../../gaugeVoterService';
import type { IGetGaugeRewardDistributionParams } from '../../gaugeVoterService.api';
import { gaugeVoterServiceKeys } from '../../gaugeVoterServiceKeys';

export const gaugeRewardDistributionOptions = (
    params: IGetGaugeRewardDistributionParams,
    options?: QueryOptions<IGaugeRewardDistribution>,
): SharedQueryOptions<IGaugeRewardDistribution> => ({
    queryKey: gaugeVoterServiceKeys.gaugeRewardDistribution(params),
    queryFn: () => gaugeVoterService.getGaugeRewardDistribution(params),
    ...options,
});

export const useGaugeRewardDistribution = (
    params: IGetGaugeRewardDistributionParams,
    options?: QueryOptions<IGaugeRewardDistribution>,
) => useQuery(gaugeRewardDistributionOptions(params, options));
