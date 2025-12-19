import { useInfiniteQuery } from '@tanstack/react-query';
import type { IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type {
    InfiniteQueryOptions,
    SharedInfiniteQueryOptions,
} from '@/shared/types';
import { daoService } from '../../daoService';
import type { IGetDaoPermissionsParams } from '../../daoService.api';
import { daoServiceKeys } from '../../daoServiceKeys';
import type { IDaoPermission } from '../../domain';

export const daoPermissionsOptions = (
    params: IGetDaoPermissionsParams,
    options?: InfiniteQueryOptions<
        IPaginatedResponse<IDaoPermission>,
        IGetDaoPermissionsParams
    >,
): SharedInfiniteQueryOptions<
    IPaginatedResponse<IDaoPermission>,
    IGetDaoPermissionsParams
> => ({
    queryKey: daoServiceKeys.daoPermissions(params),
    initialPageParam: params,
    queryFn: ({ pageParam }) => daoService.getDaoPermissions(pageParam),
    getNextPageParam: daoService.getNextPageParams,
    ...options,
});

export const useDaoPermissions = (
    params: IGetDaoPermissionsParams,
    options?: InfiniteQueryOptions<
        IPaginatedResponse<IDaoPermission>,
        IGetDaoPermissionsParams
    >,
) => useInfiniteQuery(daoPermissionsOptions(params, options));
