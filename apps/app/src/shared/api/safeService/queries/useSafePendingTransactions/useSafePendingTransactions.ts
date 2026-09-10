import { useQuery } from '@tanstack/react-query';
import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import { safeQueryGcTime } from '../../safeQueryConfig';
import { safeService } from '../../safeService';
import type {
    IGetSafePendingTransactionsParams,
    ISafeQueueResponse,
} from '../../safeService.api';
import { safeServiceKeys } from '../../safeServiceKeys';

export const safePendingTransactionsOptions = (
    params: IGetSafePendingTransactionsParams,
    options?: QueryOptions<ISafeQueueResponse>,
): SharedQueryOptions<ISafeQueueResponse> => ({
    queryKey: safeServiceKeys.safePendingTransactions(params),
    queryFn: () => safeService.getSafePendingTransactions(params),
    gcTime: safeQueryGcTime,
    ...options,
});

/**
 * Reads the unexecuted transactions of a Safe from Aragon's backend.
 *
 * The response is **not** filtered by nonce — consumers derive liveness from the nonce they hold.
 * Filtering server-side would put the current nonce in the cache key on both sides, so every nonce
 * advance would orphan an entry and refetch cold.
 */
export const useSafePendingTransactions = (
    params: IGetSafePendingTransactionsParams,
    options?: QueryOptions<ISafeQueueResponse>,
) => useQuery(safePendingTransactionsOptions(params, options));
