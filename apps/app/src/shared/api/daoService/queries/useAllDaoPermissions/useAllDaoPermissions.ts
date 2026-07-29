'use client';

import { useEffect, useMemo } from 'react';
import type { IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { InfiniteQueryOptions } from '@/shared/types';
import type {
    IGetDaoPermissionsParams,
    IGetDaoPermissionsQueryParams,
} from '../../daoService.api';
import type { IDaoPermission } from '../../domain';
import { useDaoPermissions } from '../useDaoPermissions';

/**
 * Hook that fetches all DAO permissions by automatically loading all pages.
 */
type IUseAllDaoPermissionsParams = Omit<
    IGetDaoPermissionsParams,
    'queryParams'
> & {
    queryParams?: IGetDaoPermissionsQueryParams;
};

export const useAllDaoPermissions = (
    params: IUseAllDaoPermissionsParams,
    options?: InfiniteQueryOptions<
        IPaginatedResponse<IDaoPermission>,
        IGetDaoPermissionsParams
    >,
) => {
    const {
        data,
        isLoading,
        error,
        hasNextPage,
        fetchNextPage,
        isFetchingNextPage,
        refetch,
    } = useDaoPermissions(
        { ...params, queryParams: { ...params.queryParams, pageSize: 50 } },
        options,
    );

    useEffect(() => {
        if (hasNextPage && !isFetchingNextPage) {
            void fetchNextPage();
        }
    }, [hasNextPage, fetchNextPage, isFetchingNextPage]);

    const allPermissions = useMemo(
        () => data?.pages.flatMap((page) => page.data) ?? [],
        [data],
    );

    return {
        data: allPermissions,
        isLoading,
        error,
        refetch,
    };
};
