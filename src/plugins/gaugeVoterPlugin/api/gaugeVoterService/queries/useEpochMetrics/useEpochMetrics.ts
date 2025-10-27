import type { QueryOptions, SharedQueryOptions } from '@/shared/types/queryOptions';
import { useQuery } from '@tanstack/react-query';
import type { IEpochMetrics } from '../../domain';
import { gaugeVoterService } from '../../gaugeVoterService';
import type { IGetEpochMetricsParams } from '../../gaugeVoterService.api';
import { gaugeVoterServiceKeys } from '../../gaugeVoterServiceKeys';
import type { IUseEpochMetricsParams } from './useEpochMetrics.api';

export const epochMetricsOptions = (
    params: IGetEpochMetricsParams,
    options?: QueryOptions<IEpochMetrics>,
): SharedQueryOptions<IEpochMetrics> => ({
    queryKey: gaugeVoterServiceKeys.epochMetrics(params),
    queryFn: () => gaugeVoterService.getEpochMetrics(params),
    ...options,
});

export const useEpochMetrics = (params: IUseEpochMetricsParams) => {
    const { queryParams, enabled = true } = params;

    const requestParams: IGetEpochMetricsParams = {
        urlParams: {
            pluginAddress: queryParams.pluginAddress as `0x${string}`,
            network: queryParams.network,
        },
    };

    return useQuery(
        epochMetricsOptions(requestParams, {
            enabled: enabled && !!queryParams.pluginAddress && !!queryParams.network,
        }),
    );
};
