import { useInfiniteQuery } from '@tanstack/react-query';
// LMM_DEMO_HACK: see app/src/modules/flow/demo/lmmDemoConfig.ts.
import { tryLmmDaoPermissionsOverride } from '@/modules/flow/demo/lmmDaoOverride';
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
    queryFn: async ({ pageParam }) => {
        const override = await tryLmmDaoPermissionsOverride(
            pageParam.urlParams.daoAddress,
        );
        if (override) {
            return override;
        }
        return daoService.getDaoPermissions(pageParam);
    },
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
