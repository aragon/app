import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import { useQuery } from '@tanstack/react-query';
import { daoService } from '../../daoService';
import type { IGetDaoPermissionsParams } from '../../daoService.api';
import { daoServiceKeys } from '../../daoServiceKeys';
import type { IDaoPermission } from '../../domain';

export const daoPermissionsOptions = (
    params: IGetDaoPermissionsParams,
    options?: QueryOptions<IDaoPermission[]>,
): SharedQueryOptions<IDaoPermission[]> => ({
    queryKey: daoServiceKeys.daoPermissions(params),
    queryFn: () => daoService.getDaoPermissions(params),
    ...options,
});

export const useDaoPermissions = (params: IGetDaoPermissionsParams, options?: QueryOptions<IDaoPermission[]>) => {
    return useQuery(daoPermissionsOptions(params, options));
};
