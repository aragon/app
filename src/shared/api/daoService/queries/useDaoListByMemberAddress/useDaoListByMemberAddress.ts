import { type IPaginatedResponse } from '@/shared/api/aragonBackendService';
import { daoService, daoServiceKeys, type IGetDaoListByMemberAddressParams, type IDao } from '@/shared/api/daoService';
import type { InfiniteQueryOptions, SharedInfiniteQueryOptions } from '@/shared/types';
import { useInfiniteQuery } from '@tanstack/react-query';

export const daoListByMemberAddressOptions = (
    params: IGetDaoListByMemberAddressParams,
    options?: InfiniteQueryOptions<IPaginatedResponse<IDao>, IGetDaoListByMemberAddressParams>,
): SharedInfiniteQueryOptions<IPaginatedResponse<IDao>, IGetDaoListByMemberAddressParams> => ({
    queryKey: daoServiceKeys.daoListByMemberAddress(params),
    initialPageParam: params,
    queryFn: ({ pageParam }) => daoService.getDaoListByMember(pageParam),
    getNextPageParam: daoService.getNextPageParamsUrl,
    ...options,
});

export const useDaoListByMemberAddress = (
    params: IGetDaoListByMemberAddressParams,
    options?: InfiniteQueryOptions<IPaginatedResponse<IDao>, IGetDaoListByMemberAddressParams>,
) => {
    return useInfiniteQuery(daoListByMemberAddressOptions(params, options));
};
