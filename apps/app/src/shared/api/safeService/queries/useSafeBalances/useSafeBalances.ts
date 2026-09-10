import { useQuery } from '@tanstack/react-query';
import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import type { ISafeBalance } from '../../domain';
import { safeQueryGcTime } from '../../safeQueryConfig';
import type { IGetSafeBalancesParams } from '../../safeService.api';
import { safeServiceKeys } from '../../safeServiceKeys';
import { safeTransactionService } from '../../safeTransactionService';

export const safeBalancesOptions = (
    params: IGetSafeBalancesParams,
    options?: QueryOptions<ISafeBalance[]>,
): SharedQueryOptions<ISafeBalance[]> => ({
    queryKey: safeServiceKeys.safeBalances(params),
    queryFn: () => safeTransactionService.getSafeBalances(params),
    gcTime: safeQueryGcTime,
    ...options,
});

/**
 * Still reads the Safe transaction service directly. Aragon owns balances via `/v2/assets`, but that
 * cutover belongs to the Safe-as-account work (APP-1096) — see `safeTransactionService`.
 */
export const useSafeBalances = (
    params: IGetSafeBalancesParams,
    options?: QueryOptions<ISafeBalance[]>,
) => useQuery(safeBalancesOptions(params, options));
