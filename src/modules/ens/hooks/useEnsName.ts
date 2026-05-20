import { addressUtils } from '@aragon/gov-ui-kit';
import { useEffect } from 'react';
// biome-ignore lint/style/noRestrictedImports: authorised wrapper over wagmi's useEnsName (centralises chainId and cache)
import { useEnsName as useWagmiEnsName } from 'wagmi';
import { memberRegistrySubdomainSuffix } from '../constants/contracts';
import { ensCache, ensChainId } from '../constants/ensConfig';
import { logEnsError } from '../utils/logEnsError';

export interface IUseEnsNameOptions {
    /**
     * When true and the resolved ENS is an Aragon member-registry subdomain
     * (e.g. `alice.aragonx.eth`), the hook returns just the subdomain (`alice`).
     * Used on member-facing surfaces: member list items (token + default),
     * delegation card, and profile header (title and breadcrumb).
     * Anywhere else, leave this off so the full ENS is shown.
     */
    stripAragonRegistrySuffix?: boolean;
}

/**
 * Resolves the primary ENS name for a given Ethereum address.
 *
 * Thin wrapper over wagmi's `useEnsName` that centralises `chainId` (always mainnet)
 * and cache configuration so every consumer gets consistent behaviour without
 * duplicating config. Uses TanStack Query under the hood with long-lived TTLs.
 *
 * All calls are auto-batched into a single multicall RPC request via viem's `batch.multicall`.
 *
 * @param address - Hex Ethereum address (`0x…`) or `undefined` to skip.
 * @param options - Optional behaviour flags (see `IUseEnsNameOptions`).
 */
export function useEnsName(
    address: string | undefined,
    options?: IUseEnsNameOptions,
) {
    const { stripAragonRegistrySuffix = false } = options ?? {};

    const validAddress =
        address != null && addressUtils.isAddress(address)
            ? addressUtils.getChecksum(address)
            : undefined;

    const result = useWagmiEnsName({
        address: validAddress,
        chainId: ensChainId,
        query: {
            enabled: validAddress != null,
            staleTime: ensCache.staleTime,
            gcTime: ensCache.gcTime,
        },
    });

    useEffect(() => {
        if (result.error == null || validAddress == null) {
            return;
        }
        logEnsError(result.error, {
            hook: 'useEnsName',
            address: validAddress,
            chainId: ensChainId,
        });
    }, [result.error, validAddress]);

    const data =
        stripAragonRegistrySuffix &&
        result.data?.endsWith(memberRegistrySubdomainSuffix)
            ? result.data.slice(0, -memberRegistrySubdomainSuffix.length)
            : result.data;

    return { ...result, data };
}
