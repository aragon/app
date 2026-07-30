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

    // While auto-paginating, `isLoading` only tracks the first page and `data`
    // defaults to an empty array, so neither can express "the full permission
    // set is not ready yet".
    const isFetchingAll = isLoading || hasNextPage || isFetchingNextPage;

    useEffect(() => {
        if (hasNextPage && !isFetchingNextPage) {
            void fetchNextPage();
        }
    }, [hasNextPage, fetchNextPage, isFetchingNextPage]);

    const allPermissions = useMemo(
        () =>
            isFetchingAll || error
                ? undefined
                : (data?.pages.flatMap((page) => page.data) ?? []),
        [data, isFetchingAll, error],
    );

    return {
        data: allPermissions,
        isLoading: isFetchingAll,
        error,
        refetch,
    };
};
