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
    queryFn: ({ pageParam }) => daoExplorerService.getDaoList(pageParam),
    initialPageParam: params,
    getNextPageParam: ({ skip, limit, data }) => {
        if (data.length === 0) {
            return undefined;
        }

        return {
            ...params,
            queryParams: {
                ...params.queryParams,
                skip: skip + limit,
            },
        };
    },
    ...options,
});

export const useDaoList = (
    params: IGetDaoListParams,
    options?: InfiniteQueryOptions<IPaginatedResponse<IDao>, IGetDaoListParams>,
) => {
    return useInfiniteQuery(daoListOptions(params, options));
};
