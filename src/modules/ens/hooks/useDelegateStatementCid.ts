import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { normalize } from 'viem/ens';
import { getEnsText } from 'wagmi/actions';
import { wagmiConfig } from '@/modules/application/constants/wagmi';
import type { Network } from '@/shared/api/daoService';
import { ENS_CACHE, ENS_CHAIN_ID } from '../constants/ensConfig';
import { buildEnsDelegateKey } from '../constants/ensDelegateKey';
import { logEnsError } from '../utils/logEnsError';

export interface IUseDelegateStatementCidParams {
    /**
     * Primary ENS name of the profile being viewed. The hook is disabled when
     * `null` so callers can pass the result of `useEnsName` directly.
     */
    ensName: string | null | undefined;
    /**
     * Network the tokens are deployed on; selects the ENS-key shortname.
     * All tokens passed in a single call must share the same network. Pass
     * `undefined` while the DAO is loading — the hook stays disabled rather
     * than guessing a default.
     */
    network: Network | undefined;
    /**
     * Token contract addresses with delegation enabled on this profile's DAO.
     * Order is preserved in the returned record.
     */
    tokenAddresses: readonly string[];
}

/**
 * Map of token address (lower-cased) → CID string (or `null` if no record).
 */
export type TDelegateStatementCidMap = Record<string, string | null>;

/**
 * Fetches per-token delegate-statement CIDs from ENS text records on Ethereum
 * mainnet (the canonical ENS chain). Each `getEnsText` call is a `readContract`
 * under the hood; with `batch.multicall: true` on the viem client, all calls
 * inside the `Promise.allSettled` collapse into one multicall RPC request.
 *
 * Mirrors the structure of `useEnsRecords` but takes a dynamic per-token key
 * set (`<shortname>.<tokenAddress>.delegate`) instead of the closed
 * `ENS_PROFILE_KEYS` set, since each DAO's token list is variable.
 *
 * Mainnet-first by design: only `Network.ETHEREUM_MAINNET` is enrolled in the
 * shortname map today (see `NETWORK_EIP3770_SHORTNAME`). On networks without
 * an agreed shortname, `buildEnsDelegateKey` throws and the query rejects with
 * that error — extending to L2s is a one-line map addition once the
 * cross-chain key shape is confirmed with ENS.
 */
export const useDelegateStatementCid = (
    params: IUseDelegateStatementCidParams,
) => {
    const { ensName, network, tokenAddresses } = params;
    const isValid =
        ensName != null &&
        ensName.length > 0 &&
        network != null &&
        tokenAddresses.length > 0;

    const result = useQuery<TDelegateStatementCidMap>({
        queryKey: [
            'delegateStatementCid',
            ensName,
            network,
            ...tokenAddresses.map((address) => address.toLowerCase()),
        ],
        queryFn: async () => {
            if (!isValid || network == null) {
                return {};
            }

            const normalizedName = normalize(ensName);
            const keys = tokenAddresses.map((tokenAddress) =>
                buildEnsDelegateKey({ network, tokenAddress }),
            );

            const settled = await Promise.allSettled(
                keys.map((key) =>
                    getEnsText(wagmiConfig, {
                        name: normalizedName,
                        key,
                        chainId: ENS_CHAIN_ID,
                    }),
                ),
            );

            return Object.fromEntries(
                tokenAddresses.map((tokenAddress, index) => {
                    const entry = settled[index];
                    const value =
                        entry.status === 'fulfilled' && entry.value != null
                            ? entry.value
                            : null;
                    return [tokenAddress.toLowerCase(), value];
                }),
            );
        },
        enabled: isValid,
        staleTime: ENS_CACHE.staleTime,
        gcTime: ENS_CACHE.gcTime,
    });

    useEffect(() => {
        if (result.error == null || ensName == null) {
            return;
        }
        logEnsError(result.error, {
            hook: 'useDelegateStatementCid',
            name: ensName,
            chainId: ENS_CHAIN_ID,
        });
    }, [result.error, ensName]);

    return result;
};
