import type { IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { InfiniteQueryOptions, SharedInfiniteQueryOptions } from '@/shared/types/queryOptions';
import { useInfiniteQuery } from '@tanstack/react-query';
import { gaugeVoterService } from '../../gaugeVoterService';
import { type IGetGaugeListParams, type IGetGaugeListResult } from '../../gaugeVoterService.api';
import { gaugeVoterServiceKeys } from '../../gaugeVoterServiceKeys';

export const gaugeListOptions = (
    params: IGetGaugeListParams,
    debugHasVoted?: boolean,
    debugIsVotingPeriod?: boolean,
    options?: InfiniteQueryOptions<IPaginatedResponse<IGetGaugeListResult>, IGetGaugeListParams>,
): SharedInfiniteQueryOptions<IPaginatedResponse<IGetGaugeListResult>, IGetGaugeListParams> => ({
    queryKey: [...gaugeVoterServiceKeys.gauges(params), debugHasVoted, debugIsVotingPeriod],
    initialPageParam: params,
    queryFn: ({ pageParam }) => gaugeVoterService.getGaugeList(pageParam, debugHasVoted, debugIsVotingPeriod),
    getNextPageParam: gaugeVoterService.getNextPageParams,
    ...options,
});

export const useGaugeList = (
    params: IGetGaugeListParams,
    debugHasVoted?: boolean,
    debugIsVotingPeriod?: boolean,
    options?: InfiniteQueryOptions<IPaginatedResponse<IGetGaugeListResult>, IGetGaugeListParams>,
) => useInfiniteQuery(gaugeListOptions(params, debugHasVoted, debugIsVotingPeriod, options));
