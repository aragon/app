import { useQuery } from '@tanstack/react-query';
import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import { safeQueryGcTime } from '../../safeQueryConfig';
import { safeService } from '../../safeService';
import type {
    IGetSafeInfoParams,
    ISafeInfoResponse,
} from '../../safeService.api';
import { safeServiceKeys } from '../../safeServiceKeys';

export const safeInfoOptions = (
    params: IGetSafeInfoParams,
    options?: QueryOptions<ISafeInfoResponse>,
): SharedQueryOptions<ISafeInfoResponse> => ({
    queryKey: safeServiceKeys.safeInfo(params),
    queryFn: () => safeService.getSafeInfo(params),
    gcTime: safeQueryGcTime,
    ...options,
});

/**
 * Reads owners, threshold, version and nonce of a Safe from Aragon's backend, which serves them from
 * contract reads — this costs no Safe transaction service quota. Owners and threshold are live
 * values that change under a queued transaction, so this must never be cached across sessions.
 */
export const useSafeInfo = (
    params: IGetSafeInfoParams,
    options?: QueryOptions<ISafeInfoResponse>,
) => useQuery(safeInfoOptions(params, options));
