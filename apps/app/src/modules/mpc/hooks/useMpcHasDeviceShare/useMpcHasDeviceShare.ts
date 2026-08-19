import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { mpcServiceKeys } from '@/modules/mpc/api/mpcService';
import type { MpcProviderId } from '@/modules/mpc/api/mpcService/domain';
import { useMpcProvider } from '@/modules/mpc/hooks/useMpcProvider';

export interface IUseMpcHasDeviceShareResult {
    /**
     * Whether the device share of the system is stored in this browser (undefined while checking).
     */
    hasDeviceShare?: boolean;
    /**
     * Whether the storage is being checked.
     */
    isLoading: boolean;
    /**
     * Re-checks the storage (to be called after a ceremony / recovery / reshare).
     */
    refresh: () => void;
}

/**
 * Checks whether the provider holds a device share for the given system in this browser.
 * Uses react-query so every component of the page shares the same result.
 */
export const useMpcHasDeviceShare = (
    systemId: string,
    providerId?: MpcProviderId,
): IUseMpcHasDeviceShareResult => {
    const provider = useMpcProvider(providerId);
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: mpcServiceKeys.deviceShare(systemId),
        queryFn: () => provider.hasDeviceShare(systemId),
        staleTime: 0,
    });

    const refresh = useCallback(() => {
        void queryClient.invalidateQueries({
            queryKey: mpcServiceKeys.deviceShare(systemId),
        });
    }, [queryClient, systemId]);

    return { hasDeviceShare: data, isLoading, refresh };
};
