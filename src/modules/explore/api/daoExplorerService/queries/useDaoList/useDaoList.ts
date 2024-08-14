import { type IPaginatedResponse } from '@/shared/api/aragonBackendService';
import { type IDao } from '@/shared/api/daoService';
import type { InfiniteQueryOptions, SharedInfiniteQueryOptions } from '@/shared/types';
import { useInfiniteQuery } from '@tanstack/react-query';
import { daoExplorerService } from '../../daoExplorerService';
import { type IGetDaoListParams } from '../../daoExplorerService.api';
import { daoExplorerServiceKeys } from '../../daoExplorerServiceKeys';

export const daoListOptions = (
    params: IGetDaoListParams,
    options?: InfiniteQueryOptions<IPaginatedResponse<IDao>, IGetDaoListParams>,
): SharedInfiniteQueryOptions<IPaginatedResponse<IDao>, IGetDaoListParams> => ({
    queryKey: daoExplorerServiceKeys.daoList(params),
    initialPageParam: params,
    queryFn: ({ pageParam }) => daoExplorerService.getDaoList(pageParam),
    getNextPageParam: daoExplorerService.getNextPageParamsQuery,
    ...options,
});

export const useDaoList = (
    params: IGetDaoListParams,
    options?: InfiniteQueryOptions<IPaginatedResponse<IDao>, IGetDaoListParams>,
) => {
    return useInfiniteQuery(daoListOptions(params, options));
};
