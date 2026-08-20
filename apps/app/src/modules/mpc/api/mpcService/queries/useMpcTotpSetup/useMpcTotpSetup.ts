import { useQuery } from '@tanstack/react-query';
import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import type { IMpcTotpSetupResponse } from '../../domain';
import { mpcService } from '../../mpcService';
import { mpcServiceKeys } from '../../mpcServiceKeys';

/**
 * Fetches the pending TOTP enrollment secret (the endpoint is an idempotent POST: it returns the same secret
 * until the enrollment is confirmed). Modeled as a query so mounting the enrollment screen fetches it —
 * mutations fired from mount effects lose their result under the React strict-mode double mount.
 */
export const mpcTotpSetupOptions = (
    options?: QueryOptions<IMpcTotpSetupResponse>,
): SharedQueryOptions<IMpcTotpSetupResponse> => ({
    queryKey: mpcServiceKeys.totpSetup(),
    queryFn: () => mpcService.setupTotp(),
    // The secret must not change while the QR code is on screen; drop the cache when leaving the screen so a
    // later re-enrollment starts fresh.
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: 0,
    retry: false,
    ...options,
});

export const useMpcTotpSetup = (
    options?: QueryOptions<IMpcTotpSetupResponse>,
) => useQuery(mpcTotpSetupOptions(options));
