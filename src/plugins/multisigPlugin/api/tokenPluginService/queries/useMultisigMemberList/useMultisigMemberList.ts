import { type IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { InfiniteQueryOptions, SharedInfiniteQueryOptions } from '@/shared/types';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { IMultisigMember } from '../../domain';
import { multisigPluginService } from '../../multisigPluginService';
import type { IGetMultisigMemberListParams } from '../../multisigPluginService.api';
import { multisigPluginServiceKeys } from '../../multisigPluginServiceKeys';

export const multisigMemberListOptions = (
    params: IGetMultisigMemberListParams,
    options?: InfiniteQueryOptions<IPaginatedResponse<IMultisigMember>, IGetMultisigMemberListParams>,
): SharedInfiniteQueryOptions<IPaginatedResponse<IMultisigMember>, IGetMultisigMemberListParams> => ({
    queryKey: multisigPluginServiceKeys.multisigMemberList(params),
    initialPageParam: params,
    queryFn: ({ pageParam }) => multisigPluginService.getMultisigMemberList(pageParam),
    getNextPageParam: multisigPluginService.getNextPageParams,
    ...options,
});

export const useMultisigMemberList = (
    params: IGetMultisigMemberListParams,
    options?: InfiniteQueryOptions<IPaginatedResponse<IMultisigMember>, IGetMultisigMemberListParams>,
) => {
    return useInfiniteQuery(multisigMemberListOptions(params, options));
};
