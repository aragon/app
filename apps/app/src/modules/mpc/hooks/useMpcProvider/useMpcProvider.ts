import { useMemo } from 'react';
import type { MpcProviderId } from '@/modules/mpc/api/mpcService/domain';
import {
    getMpcProvider,
    type IMpcProviderAdapter,
} from '@/modules/mpc/providers';

/**
 * Returns the provider adapter for the given provider id (defaults to the mock Shamir provider of the POC).
 */
export const useMpcProvider = (
    providerId: MpcProviderId = 'mock-shamir',
): IMpcProviderAdapter =>
    useMemo(() => getMpcProvider(providerId), [providerId]);
