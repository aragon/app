'use client';

import { useEffect, useMemo } from 'react';
import type { IPaginatedResponse } from '@/shared/api/aragonBackendService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
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
export type IUseAllAllowedActionsParams = Omit<
    IGetAllowedActionsParams,
    'queryParams'
> & {
    /**
     * Query parameters of the request, the page size is set by the hook.
     */
    queryParams?: IGetAllowedActionsQueryParams;
    /**
     * Chain ID to return the allowed actions for, the actions of all chains are returned when not
     * set. Actions without a chain ID are only relevant for the chain of the DAO, therefore they are
     * only returned when this matches the DAO chain.
     */
    chainId?: number;
};

/**
 * Hook that fetches all allowed actions of a plugin by automatically loading all pages. Only returns
 * the actions relevant for the specified chain when a chain ID is set. The data stays undefined until
 * the full set is known, also when the query is disabled, so that an unknown allowlist can be told
 * apart from an empty one.
 */
export const useAllAllowedActions = (
    params: IUseAllAllowedActionsParams,
    options?: InfiniteQueryOptions<
        IPaginatedResponse<IAllowedAction>,
        IGetAllowedActionsParams
    >,
) => {
    // Keep the chain ID out of the request params to avoid fetching the same actions once per chain.
    const { chainId, ...requestParams } = params;

    const {
        data,
        isLoading,
        error,
        hasNextPage,
        fetchNextPage,
        isFetchingNextPage,
        refetch,
    } = useAllowedActions(
        {
            ...requestParams,
            queryParams: { ...requestParams.queryParams, pageSize: 50 },
        },
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

    // Consumers disable the query while the network they fetch for is unknown, so the network is not
    // guaranteed to resolve to a chain.
    const daoChainId = networkDefinitions[params.urlParams.network]?.id;

    const allAllowedActions = useMemo(() => {
        // A disabled query is neither loading nor holding data, so the loading flag alone cannot
        // express that the actions are unknown.
        if (data == null || isFetchingAll || error) {
            return undefined;
        }

        const actions = data.pages.flatMap((page) => page.data);

        if (chainId == null) {
            return actions;
        }

        // The chain ID of an action is not guaranteed to be back-filled, an action without it is
        // considered to be on the DAO chain.
        return actions.filter(
            (action) => (action.chainId ?? daoChainId) === chainId,
        );
    }, [data, isFetchingAll, error, chainId, daoChainId]);

    return {
        data: allAllowedActions,
        isLoading: isFetchingAll,
        error,
        refetch,
    };
};
