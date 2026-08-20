import { useQuery } from '@tanstack/react-query';
import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import type {
    ISafeMultisigTransaction,
    ISafePaginatedResponse,
} from '../../domain';
import { safeService } from '../../safeService';
import type { IGetSafePendingTransactionsParams } from '../../safeService.api';
import { safeServiceKeys } from '../../safeServiceKeys';

type ISafePendingTransactions =
    ISafePaginatedResponse<ISafeMultisigTransaction>;

export const safePendingTransactionsOptions = (
    params: IGetSafePendingTransactionsParams,
    options?: QueryOptions<ISafePendingTransactions>,
): SharedQueryOptions<ISafePendingTransactions> => ({
    queryKey: safeServiceKeys.safePendingTransactions(params),
    queryFn: () => safeService.getSafePendingTransactions(params),
    ...options,
});

/**
 * Reads the live queue of a Safe. Pass the Safe's current nonce (from `useSafeInfo`) as
 * `currentNonce`: unexecuted transactions below it are permanently dead, not pending.
 */
export const useSafePendingTransactions = (
    params: IGetSafePendingTransactionsParams,
    options?: QueryOptions<ISafePendingTransactions>,
) => useQuery(safePendingTransactionsOptions(params, options));
