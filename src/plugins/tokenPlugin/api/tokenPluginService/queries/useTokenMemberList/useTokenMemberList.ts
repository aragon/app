import { type IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { InfiniteQueryOptions, SharedInfiniteQueryOptions } from '@/shared/types';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { ITokenMember } from '../../domain';
import { tokenPluginService } from '../../tokenPluginService';
import type { IGetTokenMemberListParams } from '../../tokenPluginService.api';
import { tokenPluginServiceKeys } from '../../tokenPluginServiceKeys';

export const tokenMemberListOptions = (
    params: IGetTokenMemberListParams,
    options?: InfiniteQueryOptions<IPaginatedResponse<ITokenMember>, IGetTokenMemberListParams>,
): SharedInfiniteQueryOptions<IPaginatedResponse<ITokenMember>, IGetTokenMemberListParams> => ({
    queryKey: tokenPluginServiceKeys.tokenMemberList(params),
    initialPageParam: params,
    queryFn: ({ pageParam }) => tokenPluginService.getTokenMemberList(pageParam),
    getNextPageParam: tokenPluginService.getNextPageParams,
    ...options,
});

export const useTokenMemberList = (
    params: IGetTokenMemberListParams,
    options?: InfiniteQueryOptions<IPaginatedResponse<ITokenMember>, IGetTokenMemberListParams>,
) => {
    return useInfiniteQuery(tokenMemberListOptions(params, options));
};
