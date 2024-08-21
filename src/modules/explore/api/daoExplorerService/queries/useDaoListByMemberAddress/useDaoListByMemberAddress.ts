import { type IPaginatedResponse } from '@/shared/api/aragonBackendService';
import { type IDao } from '@/shared/api/daoService';
import type { InfiniteQueryOptions, SharedInfiniteQueryOptions } from '@/shared/types';
import { useInfiniteQuery } from '@tanstack/react-query';
import { daoExplorerService } from '../../daoExplorerService';
import { type IGetDaoListByMemberAddressParams } from '../../daoExplorerService.api';
import { daoExplorerServiceKeys } from '../../daoExplorerServiceKeys';

export const daoListByMemberAddressOptions = (
    params: IGetDaoListByMemberAddressParams,
    options?: InfiniteQueryOptions<IPaginatedResponse<IDao>, IGetDaoListByMemberAddressParams>,
): SharedInfiniteQueryOptions<IPaginatedResponse<IDao>, IGetDaoListByMemberAddressParams> => ({
    queryKey: daoExplorerServiceKeys.daoListByMemberAddress(params),
    initialPageParam: params,
    queryFn: ({ pageParam }) => daoExplorerService.getDaoListByMemberAddress(pageParam),
    getNextPageParam: daoExplorerService.getNextPageParams,
    ...options,
});

export const useDaoListByMemberAddress = (
    params: IGetDaoListByMemberAddressParams,
    options?: InfiniteQueryOptions<IPaginatedResponse<IDao>, IGetDaoListByMemberAddressParams>,
) => {
    return useInfiniteQuery(daoListByMemberAddressOptions(params, options));
};
