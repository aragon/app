import type { MpcProviderId } from '@/modules/mpc/api/mpcService/domain';
import { dfnsProvider } from './dfnsProvider';
import { dynamicProvider } from './dynamicProvider';
import { mockShamirProvider } from './mockShamirProvider';
import type { IMpcProviderAdapter } from './mpcProvider.api';

export const mpcProviders: Record<MpcProviderId, IMpcProviderAdapter> = {
    'mock-shamir': mockShamirProvider,
    dfns: dfnsProvider,
    dynamic: dynamicProvider,
};

/**
 * Returns the provider adapter for the given provider id, throws for unknown ids.
 */
export const getMpcProvider = (id: MpcProviderId): IMpcProviderAdapter => {
    const provider = mpcProviders[id];

    if (provider == null) {
        throw new Error(`mpcProviderRegistry: unknown provider "${id}"`);
    }

    return provider;
};

export const mpcProviderRegistry = { getMpcProvider, mpcProviders };
