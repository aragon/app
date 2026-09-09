import { useQuery } from '@tanstack/react-query';
import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import { safeQueryGcTime } from '../../safeQueryConfig';
import { safeService } from '../../safeService';
import type {
    IGetSafeTransactionHistoryParams,
    ISafeQueueResponse,
} from '../../safeService.api';
import { safeServiceKeys } from '../../safeServiceKeys';

export const safeTransactionHistoryOptions = (
    params: IGetSafeTransactionHistoryParams,
    options?: QueryOptions<ISafeQueueResponse>,
): SharedQueryOptions<ISafeQueueResponse> => ({
    queryKey: safeServiceKeys.safeTransactionHistory(params),
    queryFn: () => safeService.getSafeTransactionHistory(params),
    gcTime: safeQueryGcTime,
    ...options,
});

/**
 * Reads the executed transactions of a Safe from Aragon's backend, newest nonce first.
 *
 * Executed transactions are immutable, so this needs no polling: a consumer reads it once a report
 * has settled, to recover the confirmations, nonce and onchain hash the queue stops serving the
 * moment a transaction executes.
 */
export const useSafeTransactionHistory = (
    params: IGetSafeTransactionHistoryParams,
    options?: QueryOptions<ISafeQueueResponse>,
) => useQuery(safeTransactionHistoryOptions(params, options));
