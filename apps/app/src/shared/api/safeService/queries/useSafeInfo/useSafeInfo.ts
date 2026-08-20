import { useQuery } from '@tanstack/react-query';
import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import type { ISafeInfo } from '../../domain';
import { safeService } from '../../safeService';
import type { IGetSafeInfoParams } from '../../safeService.api';
import { safeServiceKeys } from '../../safeServiceKeys';

export const safeInfoOptions = (
    params: IGetSafeInfoParams,
    options?: QueryOptions<ISafeInfo>,
): SharedQueryOptions<ISafeInfo> => ({
    queryKey: safeServiceKeys.safeInfo(params),
    queryFn: () => safeService.getSafeInfo(params),
    ...options,
});

/**
 * Reads owners, threshold, version and nonce of a Safe. Owners and threshold are live values —
 * they change under a queued transaction — so this must never be cached across sessions.
 */
export const useSafeInfo = (
    params: IGetSafeInfoParams,
    options?: QueryOptions<ISafeInfo>,
) => useQuery(safeInfoOptions(params, options));
