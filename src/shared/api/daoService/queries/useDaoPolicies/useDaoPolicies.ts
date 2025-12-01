import type { IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { InfiniteQueryOptions, SharedInfiniteQueryOptions } from '@/shared/types';
import { useInfiniteQuery } from '@tanstack/react-query';
import { daoService } from '../../daoService';
import type { IGetDaoPoliciesParams } from '../../daoService.api';
import { daoServiceKeys } from '../../daoServiceKeys';
import type { IDaoPolicy } from '../../domain';

export const daoPoliciesOptions = (
    params: IGetDaoPoliciesParams,
    options?: InfiniteQueryOptions<IPaginatedResponse<IDaoPolicy>, IGetDaoPoliciesParams>,
): SharedInfiniteQueryOptions<IPaginatedResponse<IDaoPolicy>, IGetDaoPoliciesParams> => ({
    queryKey: daoServiceKeys.daoPolicies(params),
    initialPageParam: params,
    queryFn: ({ pageParam }) => daoService.getDaoPolicies(pageParam),
    getNextPageParam: daoService.getNextPageParams,
    ...options,
});

export const useDaoPolicies = (
    params: IGetDaoPoliciesParams,
    options?: InfiniteQueryOptions<IPaginatedResponse<IDaoPolicy>, IGetDaoPoliciesParams>,
) => {
    return useInfiniteQuery(daoPoliciesOptions(params, options));
};
