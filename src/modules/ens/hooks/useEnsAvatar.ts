import { useEffect, useMemo } from 'react';
import { normalize } from 'viem/ens';
// biome-ignore lint/style/noRestrictedImports: authorised wrapper over wagmi's useEnsAvatar (centralises chainId and cache)
import { useEnsAvatar as useWagmiEnsAvatar } from 'wagmi';
import { ENS_CACHE, ENS_CHAIN_ID } from '../constants/ensConfig';
import { logEnsError } from '../utils/logEnsError';

/**
 * Resolves the avatar for an ENS name.
 *
 * Normalises the ENS name once and centralises cache configuration so every
 * consumer gets the same behaviour.
 *
 * @param name - ENS name (for example `"vitalik.eth"`), or `null`/`undefined` to skip.
 */
export function useEnsAvatar(name: string | null | undefined) {
    const { error: normalizeError, normalizedName } = useMemo(() => {
        if (name == null || name.length === 0) {
            return {
                error: null,
                normalizedName: undefined,
            };
        }

        try {
            return {
                error: null,
                normalizedName: normalize(name),
            };
        } catch (error) {
            return {
                error,
                normalizedName: undefined,
            };
        }
    }, [name]);

    const result = useWagmiEnsAvatar({
        name: normalizedName,
        chainId: ENS_CHAIN_ID,
        query: {
            enabled: normalizedName != null,
            staleTime: ENS_CACHE.staleTime,
            gcTime: ENS_CACHE.gcTime,
        },
    });

    useEffect(() => {
        if (normalizeError == null || name == null) {
            return;
        }
        logEnsError(normalizeError, {
            hook: 'useEnsAvatar',
            stage: 'normalize',
            name,
            chainId: ENS_CHAIN_ID,
        });
    }, [normalizeError, name]);

    useEffect(() => {
        if (result.error == null || normalizedName == null) {
            return;
        }
        logEnsError(result.error, {
            hook: 'useEnsAvatar',
            stage: 'resolve',
            name: normalizedName,
            chainId: ENS_CHAIN_ID,
        });
    }, [result.error, normalizedName]);

    return result;
}
