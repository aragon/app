import { useQuery } from '@tanstack/react-query';
import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import type { ISafeBalance } from '../../domain';
import { safeQueryGcTime } from '../../safeQueryConfig';
import { safeService } from '../../safeService';
import type { IGetSafeBalancesParams } from '../../safeService.api';
import { safeServiceKeys } from '../../safeServiceKeys';

export const safeBalancesOptions = (
    params: IGetSafeBalancesParams,
    options?: QueryOptions<ISafeBalance[]>,
): SharedQueryOptions<ISafeBalance[]> => ({
    queryKey: safeServiceKeys.safeBalances(params),
    queryFn: () => safeService.getSafeBalances(params),
    gcTime: safeQueryGcTime,
    ...options,
});

export const useSafeBalances = (
    params: IGetSafeBalancesParams,
    options?: QueryOptions<ISafeBalance[]>,
) => useQuery(safeBalancesOptions(params, options));
