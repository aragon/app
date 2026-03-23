import { useEffect } from 'react';
import { isAddress } from 'viem';
// biome-ignore lint/style/noRestrictedImports: authorised wrapper over wagmi's useEnsName (centralises chainId and cache)
import { useEnsName as useWagmiEnsName } from 'wagmi';
import { ENS_CACHE, ENS_CHAIN_ID } from '../constants/ensConfig';
import { logEnsError } from '../utils/logEnsError';

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
 */
export function useEnsName(address: string | undefined) {
    const validAddress =
        address != null && isAddress(address) ? address : undefined;

    const result = useWagmiEnsName({
        address: validAddress,
        chainId: ENS_CHAIN_ID,
        query: {
            enabled: validAddress != null,
            staleTime: ENS_CACHE.staleTime,
            gcTime: ENS_CACHE.gcTime,
        },
    });

    useEffect(() => {
        if (result.error == null || validAddress == null) {
            return;
        }
        logEnsError(result.error, {
            hook: 'useEnsName',
            address: validAddress,
            chainId: ENS_CHAIN_ID,
        });
    }, [result.error, validAddress]);

    return result;
}
