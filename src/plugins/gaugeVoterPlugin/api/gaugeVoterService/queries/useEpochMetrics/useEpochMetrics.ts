import { useQuery } from '@tanstack/react-query';
import type {
    QueryOptions,
    SharedQueryOptions,
} from '@/shared/types/queryOptions';
import type { IEpochMetrics } from '../../domain';
import { gaugeVoterService } from '../../gaugeVoterService';
import type { IGetEpochMetricsParams } from '../../gaugeVoterService.api';
import { gaugeVoterServiceKeys } from '../../gaugeVoterServiceKeys';

export const epochMetricsOptions = (
    params: IGetEpochMetricsParams,
    options?: QueryOptions<IEpochMetrics>,
): SharedQueryOptions<IEpochMetrics> => ({
    queryKey: gaugeVoterServiceKeys.epochMetrics(params),
    queryFn: () => gaugeVoterService.getEpochMetrics(params),
    ...options,
});

export const useEpochMetrics = (
    params: IGetEpochMetricsParams,
    options?: QueryOptions<IEpochMetrics>,
) => useQuery(epochMetricsOptions(params, options));
