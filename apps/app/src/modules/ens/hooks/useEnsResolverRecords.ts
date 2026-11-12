import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import {
    type Address,
    decodeFunctionResult,
    encodeFunctionData,
    type Hex,
    toHex,
} from 'viem';
import { mainnet } from 'viem/chains';
import { namehash, normalize, packetToBytes } from 'viem/ens';
import { readContract } from 'wagmi/actions';
import { wagmiConfig } from '@/modules/application/constants/wagmi';
import { ensUniversalResolverAbi } from '../constants/contracts';
import { ensCache, ensChainId } from '../constants/ensConfig';
import { ensPublicResolverAbi } from '../utils/ensResolverAbi';
import { ensTransactionUtils } from '../utils/ensTransactionUtils';
import { logEnsError } from '../utils/logEnsError';

/** Live `addr` and `contenthash` resolver records for an ENS name. */
export interface IEnsResolverRecords {
    /** Address the name currently resolves to (zero address when unset). */
    addr: Address;
    /** Current content hash (encoded bytes; `0x` when unset). */
    contenthash: Hex;
}

/**
 * Reads the `addr` and `contenthash` records for an ENS name on-chain through
 * the Universal Resolver, which answers for ENSv1 and ENSv2 names alike. Unlike
 * text records (which can only be enumerated from the indexer), these are
 * single live values best read at the source — especially before a write such
 * as the registry `move`, which must carry them over unchanged.
 *
 * The query returns `null` when the name has no writable resolver (i.e. it does
 * not exist on-chain), which doubles as a reliable "profile not found" signal —
 * distinct from a profile that exists but simply has no records. The Universal
 * Resolver cannot provide that signal: it returns a mirror resolver even for
 * names that do not exist.
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

            const resolver =
                await ensTransactionUtils.getWritableResolver(normalizedName);

            if (resolver == null) {
                return null;
            }

            const node = namehash(normalizedName);
            const dnsName = toHex(packetToBytes(normalizedName));

            const resolve = async (functionName: 'addr' | 'contenthash') => {
                const [data] = await readContract(wagmiConfig, {
                    address: mainnet.contracts.ensUniversalResolver.address,
                    abi: ensUniversalResolverAbi,
                    functionName: 'resolve',
                    args: [
                        dnsName,
                        encodeFunctionData({
                            abi: ensPublicResolverAbi,
                            functionName,
                            args: [node],
                        }),
                    ],
                    chainId: ensChainId,
                });
                return data;
            };

            const [addr, contenthash] = await Promise.all([
                resolve('addr'),
                resolve('contenthash'),
            ]);

            return {
                addr: decodeFunctionResult({
                    abi: ensPublicResolverAbi,
                    functionName: 'addr',
                    data: addr,
                }),
                contenthash: decodeFunctionResult({
                    abi: ensPublicResolverAbi,
                    functionName: 'contenthash',
                    data: contenthash,
                }),
            };
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
