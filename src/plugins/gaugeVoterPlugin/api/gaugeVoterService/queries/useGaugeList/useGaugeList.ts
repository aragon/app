import { useInfiniteQuery } from '@tanstack/react-query';
import type { IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { InfiniteQueryOptions, SharedInfiniteQueryOptions } from '@/shared/types/queryOptions';
import type { IGauge } from '../../domain';
import { gaugeVoterService } from '../../gaugeVoterService';
import type { IGetGaugeListParams } from '../../gaugeVoterService.api';
import { gaugeVoterServiceKeys } from '../../gaugeVoterServiceKeys';

export const gaugeListOptions = (
    params: IGetGaugeListParams,
    options?: InfiniteQueryOptions<IPaginatedResponse<IGauge>, IGetGaugeListParams>
): SharedInfiniteQueryOptions<IPaginatedResponse<IGauge>, IGetGaugeListParams> => ({
    queryKey: gaugeVoterServiceKeys.gauges(params),
    initialPageParam: params,
    queryFn: ({ pageParam }) => gaugeVoterService.getGaugeList(pageParam),
    getNextPageParam: gaugeVoterService.getNextPageParams,
    ...options,
});

export const useGaugeList = (
    params: IGetGaugeListParams,
    options?: InfiniteQueryOptions<IPaginatedResponse<IGauge>, IGetGaugeListParams>
) => useInfiniteQuery(gaugeListOptions(params, options));
