import { useInfiniteQuery } from '@tanstack/react-query';
import type { IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { InfiniteQueryOptions, SharedInfiniteQueryOptions } from '@/shared/types';
import type { IVote } from '../../domain';
import { governanceService } from '../../governanceService';
import type { IGetVoteListParams } from '../../governanceService.api';
import { governanceServiceKeys } from '../../governanceServiceKeys';

export const voteListOptions = <TVote extends IVote = IVote>(
    params: IGetVoteListParams,
    options?: InfiniteQueryOptions<IPaginatedResponse<TVote>, IGetVoteListParams>
): SharedInfiniteQueryOptions<IPaginatedResponse<TVote>, IGetVoteListParams> => ({
    queryKey: governanceServiceKeys.voteList(params),
    initialPageParam: params,
    queryFn: ({ pageParam }) => governanceService.getVoteList(pageParam),
    getNextPageParam: governanceService.getNextPageParams,
    ...options,
});

export const useVoteList = <TVote extends IVote = IVote>(
    params: IGetVoteListParams,
    options?: InfiniteQueryOptions<IPaginatedResponse<TVote>, IGetVoteListParams>
) => useInfiniteQuery(voteListOptions(params, options));
