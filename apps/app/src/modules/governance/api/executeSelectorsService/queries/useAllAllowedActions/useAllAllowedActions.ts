'use client';

import { useEffect, useMemo } from 'react';
import type { IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { InfiniteQueryOptions } from '@/shared/types';
import type { IAllowedAction } from '../../domain';
import type {
    IGetAllowedActionsParams,
    IGetAllowedActionsQueryParams,
} from '../../executeSelectorsService.api';
import { useAllowedActions } from '../useAllowedActions';

/**
 * Parameters of the useAllAllowedActions hook.
 */
type IUseAllAllowedActionsParams = Omit<
    IGetAllowedActionsParams,
    'queryParams'
> & {
    /**
     * Query parameters of the request, the page size is set by the hook.
     */
    queryParams?: IGetAllowedActionsQueryParams;
};

/**
 * Hook that fetches all allowed actions of a plugin by automatically loading all pages.
 */
export const useAllAllowedActions = (
    params: IUseAllAllowedActionsParams,
    options?: InfiniteQueryOptions<
        IPaginatedResponse<IAllowedAction>,
        IGetAllowedActionsParams
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
    } = useAllowedActions(
        { ...params, queryParams: { ...params.queryParams, pageSize: 50 } },
        options,
    );

    // While auto-paginating, `isLoading` only tracks the first page and `data`
    // defaults to an empty array, so neither can express "the full action set
    // is not ready yet".
    const isFetchingAll = isLoading || hasNextPage || isFetchingNextPage;

    useEffect(() => {
        if (hasNextPage && !isFetchingNextPage) {
            void fetchNextPage();
        }
    }, [hasNextPage, fetchNextPage, isFetchingNextPage]);

    const allAllowedActions = useMemo(
        () =>
            isFetchingAll || error
                ? undefined
                : (data?.pages.flatMap((page) => page.data) ?? []),
        [data, isFetchingAll, error],
    );

    return {
        data: allAllowedActions,
        isLoading: isFetchingAll,
        error,
        refetch,
    };
};
