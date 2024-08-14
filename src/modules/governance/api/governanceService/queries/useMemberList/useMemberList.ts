import { type IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { InfiniteQueryOptions, SharedInfiniteQueryOptions } from '@/shared/types';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { IMember } from '../../domain';
import { governanceService } from '../../governanceService';
import type { IGetMemberListParams } from '../../governanceService.api';
import { governanceServiceKeys } from '../../governanceServiceKeys';

export const memberListOptions = <TMember extends IMember = IMember>(
    params: IGetMemberListParams,
    options?: InfiniteQueryOptions<IPaginatedResponse<TMember>, IGetMemberListParams>,
): SharedInfiniteQueryOptions<IPaginatedResponse<TMember>, IGetMemberListParams> => ({
    queryKey: governanceServiceKeys.memberList(params),
    initialPageParam: params,
    queryFn: ({ pageParam }) => governanceService.getMemberList(pageParam),
    getNextPageParam: governanceService.getNextPageParamsQuery,
    ...options,
});

export const useMemberList = <TMember extends IMember = IMember>(
    params: IGetMemberListParams,
    options?: InfiniteQueryOptions<IPaginatedResponse<TMember>, IGetMemberListParams>,
) => {
    return useInfiniteQuery(memberListOptions(params, options));
};
