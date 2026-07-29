import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { type Address, type Hex, zeroAddress } from 'viem';
import { namehash, normalize } from 'viem/ens';
import { getEnsResolver, readContract } from 'wagmi/actions';
import { wagmiConfig } from '@/modules/application/constants/wagmi';
import { ensCache, ensChainId } from '../constants/ensConfig';
import { ensPublicResolverAbi } from '../utils/ensPublicResolverAbi';
import { logEnsError } from '../utils/logEnsError';

/** Live `addr` and `contenthash` resolver records for an ENS name. */
export interface IEnsResolverRecords {
    /** Address the name currently resolves to (zero address when unset). */
    addr: Address;
    /** Current content hash (encoded bytes; `0x` when unset). */
    contenthash: Hex;
}

/**
 * Reads the `addr` and `contenthash` records for an ENS name directly from its
 * resolver, on-chain. Unlike text records (which can only be enumerated from the
 * indexer), these are single live values best read at the source — especially
 * before a write such as the registry `move`, which must carry them over unchanged.
 *
 * The query returns `null` when the name has no resolver (i.e. it does not exist
 * on-chain), which doubles as a reliable "profile not found" signal — distinct
 * from a profile that exists but simply has no records.
 *
 * @param name - ENS name to look up (e.g. `"alice.aragon.eth"`), or `null`/`undefined` to skip.
 */
export function useEnsResolverRecords(name: string | null | undefined) {
    const isValid = name != null && name.length > 0;

    const result = useQuery<IEnsResolverRecords | null>({
        queryKey: ['ensResolverRecords', name],
        queryFn: async () => {
            if (!isValid) {
                return null;
            }

            const normalizedName = normalize(name);

            const resolverAddress = await getEnsResolver(wagmiConfig, {
                name: normalizedName,
                chainId: ensChainId,
            });

            // No resolver set => the name does not resolve on-chain (not found).
            if (resolverAddress === zeroAddress) {
                return null;
            }

            const node = namehash(normalizedName);

            const [addr, contenthash] = await Promise.all([
                readContract(wagmiConfig, {
                    address: resolverAddress,
                    abi: ensPublicResolverAbi,
                    functionName: 'addr',
                    args: [node],
                    chainId: ensChainId,
                }),
                readContract(wagmiConfig, {
                    address: resolverAddress,
                    abi: ensPublicResolverAbi,
                    functionName: 'contenthash',
                    args: [node],
                    chainId: ensChainId,
                }),
            ]);

            return { addr, contenthash };
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
            hook: 'useEnsResolverRecords',
            name,
            chainId: ensChainId,
        });
    }, [result.error, name]);

    return result;
}
