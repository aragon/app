import { tokenService } from '@/plugins/tokenPlugin/api/tokenService/tokenService';
import type { IGetTokenLocksParams } from '@/plugins/tokenPlugin/api/tokenService/tokenService.api';
import { type IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { InfiniteQueryOptions, SharedInfiniteQueryOptions } from '@/shared/types';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { ITokenLock } from '../../domain';
import { tokenServiceKeys } from '../../tokenServiceKeys';

export const tokenLocksOptions = (
    params: IGetTokenLocksParams,
    options?: InfiniteQueryOptions<IPaginatedResponse<ITokenLock>, IGetTokenLocksParams>,
): SharedInfiniteQueryOptions<IPaginatedResponse<ITokenLock>, IGetTokenLocksParams> => ({
    queryKey: tokenServiceKeys.memberLocks(params),
    initialPageParam: params,
    queryFn: ({ pageParam }) => tokenService.getTokenLocks(pageParam),
    getNextPageParam: tokenService.getNextPageParams,
    ...options,
});

export const useTokenLocks = (
    params: IGetTokenLocksParams,
    options?: InfiniteQueryOptions<IPaginatedResponse<ITokenLock>, IGetTokenLocksParams>,
) => {
    return useInfiniteQuery(tokenLocksOptions(params, options));
};
