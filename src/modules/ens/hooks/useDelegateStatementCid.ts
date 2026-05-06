import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { normalize } from 'viem/ens';
import { getEnsText } from 'wagmi/actions';
import { wagmiConfig } from '@/modules/application/constants/wagmi';
import type { Network } from '@/shared/api/daoService';
import { ensCache, ensChainId } from '../constants/ensConfig';
import { buildEnsDelegateKey } from '../constants/ensDelegateKey';
import { logEnsError } from '../utils/logEnsError';

export interface IUseDelegateStatementCidParams {
    /**
     * Primary ENS name of the profile being viewed. The hook is disabled when
     * `null` so callers can pass the result of `useEnsName` directly.
     */
    ensName: string | null | undefined;
    /**
     * Network the token is deployed on; selects the ENS-key shortname. Pass
     * `undefined` while the DAO is loading — the hook stays disabled rather
     * than guessing a default.
     */
    network: Network | undefined;
    /**
     * Token contract address whose delegate-statement record is being read.
     */
    tokenAddress: string;
}

/**
 * Resolves the per-token delegate-statement CID stored in the ENS text record
 * `<shortname>.<tokenAddress>.delegate` on Ethereum mainnet (the canonical ENS
 * chain), regardless of the DAO's chain. Mainnets use canonical EIP-3770
 * shortnames; testnets share the generic `test` namespace — see
 * `NETWORK_EIP3770_SHORTNAME` for the full mapping and rationale.
 */
export const useDelegateStatementCid = (
    params: IUseDelegateStatementCidParams,
) => {
    const { ensName, network, tokenAddress } = params;
    const isEnabled =
        ensName != null &&
        ensName.length > 0 &&
        network != null &&
        tokenAddress.length > 0;

    const result = useQuery<string | null>({
        queryKey: [
            'delegateStatementCid',
            ensName,
            network,
            tokenAddress.toLowerCase(),
        ],
        queryFn: async () => {
            if (!isEnabled) {
                return null;
            }

            const normalizedName = normalize(ensName);
            const key = buildEnsDelegateKey({ network, tokenAddress });
            const value = await getEnsText(wagmiConfig, {
                name: normalizedName,
                key,
                chainId: ensChainId,
            });

            return value ?? null;
        },
        enabled: isEnabled,
        staleTime: ensCache.staleTime,
        gcTime: ensCache.gcTime,
    });

    useEffect(() => {
        if (result.error == null || ensName == null) {
            return;
        }
        logEnsError(result.error, {
            hook: 'useDelegateStatementCid',
            name: ensName,
            chainId: ensChainId,
        });
    }, [result.error, ensName]);

    return result;
};
