import { useQuery } from '@tanstack/react-query';
import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import type { ISafeTransactionActions } from '../../domain';
import { safeService } from '../../safeService';
import type { IGetSafeTransactionActionsParams } from '../../safeService.api';
import { safeServiceKeys } from '../../safeServiceKeys';

export const safeTransactionActionsOptions = (
    params: IGetSafeTransactionActionsParams,
    options?: QueryOptions<ISafeTransactionActions>,
): SharedQueryOptions<ISafeTransactionActions> => ({
    queryKey: safeServiceKeys.safeTransactionActions(params),
    queryFn: () => safeService.getSafeTransactionActions(params),
    ...options,
});

/**
 * Reads the decoded actions of a Safe transaction, identified by its Safe transaction hash.
 */
export const useSafeTransactionActions = (
    params: IGetSafeTransactionActionsParams,
    options?: QueryOptions<ISafeTransactionActions>,
) => useQuery(safeTransactionActionsOptions(params, options));
