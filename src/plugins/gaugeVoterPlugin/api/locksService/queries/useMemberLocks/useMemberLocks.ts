import { useInfiniteQuery } from '@tanstack/react-query';
import type { IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type {
    InfiniteQueryOptions,
    SharedInfiniteQueryOptions,
} from '@/shared/types';
import type { IMemberLock } from '../../domain';
import { locksService } from '../../locksService';
import type { IGetMemberLocksParams } from '../../locksService.api';
import { locksServiceKeys } from '../../locksServiceKeys';

export const memberLocksOptions = (
    params: IGetMemberLocksParams,
    options?: InfiniteQueryOptions<
        IPaginatedResponse<IMemberLock>,
        IGetMemberLocksParams
    >,
): SharedInfiniteQueryOptions<
    IPaginatedResponse<IMemberLock>,
    IGetMemberLocksParams
> => ({
    queryKey: locksServiceKeys.memberLocks(params),
    initialPageParam: params,
    queryFn: ({ pageParam }) => locksService.getMemberLocks(pageParam),
    getNextPageParam: locksService.getNextPageParams,
    ...options,
});

export const useMemberLocks = (
    params: IGetMemberLocksParams,
    options?: InfiniteQueryOptions<
        IPaginatedResponse<IMemberLock>,
        IGetMemberLocksParams
    >,
) => useInfiniteQuery(memberLocksOptions(params, options));
