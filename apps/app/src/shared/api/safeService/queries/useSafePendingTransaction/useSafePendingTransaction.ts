import { useQuery } from '@tanstack/react-query';
import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import type { ISafeMultisigTransaction } from '../../domain';
import { safeQueryGcTime } from '../../safeQueryConfig';
import { safeService } from '../../safeService';
import type { IGetSafePendingTransactionParams } from '../../safeService.api';
import { safeServiceKeys } from '../../safeServiceKeys';

export const safePendingTransactionOptions = (
    params: IGetSafePendingTransactionParams,
    options?: QueryOptions<ISafeMultisigTransaction | null>,
): SharedQueryOptions<ISafeMultisigTransaction | null> => ({
    queryKey: safeServiceKeys.safePendingTransaction(params),
    queryFn: () => safeService.getSafePendingTransaction(params),
    gcTime: safeQueryGcTime,
    ...options,
});

/**
 * Reads one unexecuted transaction of a Safe by its hash, or null once it is no longer in the queue.
 */
export const useSafePendingTransaction = (
    params: IGetSafePendingTransactionParams,
    options?: QueryOptions<ISafeMultisigTransaction | null>,
) => useQuery(safePendingTransactionOptions(params, options));
