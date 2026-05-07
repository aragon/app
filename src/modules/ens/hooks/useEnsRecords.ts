import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { normalize } from 'viem/ens';
import { getEnsText } from 'wagmi/actions';
import { wagmiConfig } from '@/modules/application/constants/wagmi';
import { ensCache, ensChainId, ensProfileKeys } from '../constants/ensConfig';
import type { IEnsRecords } from '../types';
import { logEnsError } from '../utils/logEnsError';

/**
 * Fetches multiple ENS text records for a given ENS name in a single TanStack query.
 *
 * Each `getEnsText` call is a `readContract` under the hood. With `batch.multicall: true`
 * on the viem client, all calls within the `Promise.all` are auto-batched into a single multicall RPC request.
 *
 * Uses `Promise.allSettled` so that a single record failure doesn't block the rest.
 * If ALL records fail the query returns an empty result.
 * The failure is logged once to Sentry via `result.error`.
 *
 * @param name - ENS name to look up (e.g. `"vitalik.eth"`), or `null`/`undefined` to skip.
 */
export function useEnsRecords(name: string | null | undefined) {
    const isValid = name != null && name.length > 0;

    const result = useQuery<IEnsRecords>({
        queryKey: ['ensRecords', name, ensProfileKeys],
        queryFn: async () => {
            if (!isValid) {
                return {};
            }

            const normalizedName = normalize(name);

            const settled = await Promise.allSettled(
                ensProfileKeys.map((key) =>
                    getEnsText(wagmiConfig, {
                        name: normalizedName,
                        key,
                        chainId: ensChainId,
                    }),
                ),
            );

            return Object.fromEntries(
                ensProfileKeys.map((key, i) => {
                    const entry = settled[i];
                    const value =
                        entry.status === 'fulfilled'
                            ? (entry.value ?? null)
                            : null;
                    return [key, value];
                }),
            );
        },
        enabled: isValid,
        staleTime: ensCache.staleTime,
        gcTime: ensCache.gcTime,
    });

    useEffect(() => {
        if (result.error == null || name == null) {
            return;
        }
        logEnsError(result.error, {
            hook: 'useEnsRecords',
            name,
            chainId: ensChainId,
        });
    }, [result.error, name]);

    return result;
}
