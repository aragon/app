import { useInfiniteQuery } from '@tanstack/react-query';
import type { IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { InfiniteQueryOptions, SharedInfiniteQueryOptions } from '@/shared/types';
import type { IMemberLock } from '../../domain';
import { tokenService } from '../../tokenService';
import type { IGetMemberLocksParams } from '../../tokenService.api';
import { tokenServiceKeys } from '../../tokenServiceKeys';

export const memberLocksOptions = (
    params: IGetMemberLocksParams,
    options?: InfiniteQueryOptions<IPaginatedResponse<IMemberLock>, IGetMemberLocksParams>
): SharedInfiniteQueryOptions<IPaginatedResponse<IMemberLock>, IGetMemberLocksParams> => ({
    queryKey: tokenServiceKeys.memberLocks(params),
    initialPageParam: params,
    queryFn: ({ pageParam }) => tokenService.getMemberLocks(pageParam),
    getNextPageParam: tokenService.getNextPageParams,
    ...options,
});

export const useMemberLocks = (
    params: IGetMemberLocksParams,
    options?: InfiniteQueryOptions<IPaginatedResponse<IMemberLock>, IGetMemberLocksParams>
) => useInfiniteQuery(memberLocksOptions(params, options));
