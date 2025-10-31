import type { IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { InfiniteQueryOptions, SharedInfiniteQueryOptions } from '@/shared/types/queryOptions';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { IGaugeReturn } from '../../domain';
import { gaugeVoterService } from '../../gaugeVoterService';
import type { IGetGaugeListParams } from '../../gaugeVoterService.api';
import { gaugeVoterServiceKeys } from '../../gaugeVoterServiceKeys';

export const gaugeListOptions = (
    params: IGetGaugeListParams,
    options?: InfiniteQueryOptions<IPaginatedResponse<IGaugeReturn>, IGetGaugeListParams>,
): SharedInfiniteQueryOptions<IPaginatedResponse<IGaugeReturn>, IGetGaugeListParams> => ({
    queryKey: gaugeVoterServiceKeys.gauges(params),
    initialPageParam: params,
    queryFn: ({ pageParam }) => gaugeVoterService.getGaugeList(pageParam),
    getNextPageParam: gaugeVoterService.getNextPageParams,
    ...options,
});

export const useGaugeList = (
    params: IGetGaugeListParams,
    options?: InfiniteQueryOptions<IPaginatedResponse<IGaugeReturn>, IGetGaugeListParams>,
) => useInfiniteQuery(gaugeListOptions(params, options));
