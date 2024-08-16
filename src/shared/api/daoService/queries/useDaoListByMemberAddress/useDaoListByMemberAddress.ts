import { type IPaginatedResponse } from '@/shared/api/aragonBackendService';
import { type IDao, type IGetDaoListByMemberAddressParams } from '@/shared/api/daoService';
import { daoService } from '@/shared/api/daoService/daoService';
import { daoServiceKeys } from '@/shared/api/daoService/daoServiceKeys';

import type { InfiniteQueryOptions, SharedInfiniteQueryOptions } from '@/shared/types';
import { useInfiniteQuery } from '@tanstack/react-query';

export const daoListByMemberAddressOptions = (
    params: IGetDaoListByMemberAddressParams,
    options?: InfiniteQueryOptions<IPaginatedResponse<IDao>, IGetDaoListByMemberAddressParams>,
): SharedInfiniteQueryOptions<IPaginatedResponse<IDao>, IGetDaoListByMemberAddressParams> => ({
    queryKey: daoServiceKeys.daoListByMemberAddress(params),
    initialPageParam: params,
    queryFn: ({ pageParam }) => daoService.getDaoListByMemberAddress(pageParam),
    getNextPageParam: daoService.getNextPageParams,
    ...options,
});

export const useDaoListByMemberAddress = (
    params: IGetDaoListByMemberAddressParams,
    options?: InfiniteQueryOptions<IPaginatedResponse<IDao>, IGetDaoListByMemberAddressParams>,
) => {
    return useInfiniteQuery(daoListByMemberAddressOptions(params, options));
};
