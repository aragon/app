import type { Network } from '@/shared/api/daoService';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import { safeShortNameFromNetwork } from './safeTxServiceNetworks';

const SAFE_API_KEY_ENV_VAR = 'NEXT_SECRET_SAFE_API_KEY';

const safeTxServiceBaseUrl = 'https://api.safe.global/tx-service';

export interface ISafeTxServiceEndpoint {
    /**
     * Safe transaction service short name of the chain (e.g. `eth`).
     */
    shortName: string;
    /**
     * Upstream base URL for the chain, without a trailing slash.
     */
    baseUrl: string;
}

/**
 * Resolves the upstream Safe transaction service base URL for a network. Returns undefined when
 * the network has no short name — the caller must surface that as a typed "unsupported chain"
 * state, never as a fetch failure. Unlike the RPC resolver there is no local override and no
 * public fallback: the Safe service is the only source.
 */
export const resolveServerSafeUrl = (
    network: Network,
): ISafeTxServiceEndpoint | undefined => {
    const shortName = safeShortNameFromNetwork(network);

    if (shortName == null) {
        return undefined;
    }

    return {
        shortName,
        baseUrl: `${safeTxServiceBaseUrl}/${shortName}/api`,
    };
};

/**
 * Reads the Safe API key (`process.env.NEXT_SECRET_SAFE_API_KEY`), which is sent upstream as an
 * `Authorization: Bearer` header. The key is a secret and must never reach the client, so the
 * read is gated on `process.env.NEXT_RUNTIME` (build-time-folded by Next.js) — the gate lets the
 * bundler tree-shake the key out of any client chunk that transitively reaches this module. We
 * don't apply `'server-only'` for the same reason as `resolveServerRpcUrl`: the import tracer
 * would falsely report a client-side import.
 *
 * Returns undefined when the key is unset (e.g. CI) or when called outside a server runtime.
 */
export const resolveServerSafeApiKey = (): string | undefined => {
    if (process.env.NEXT_RUNTIME !== 'nodejs') {
        monitoringUtils.logError(
            new Error(
                'Safe API key read attempted outside of a server runtime',
            ),
            { context: { nextRuntime: process.env.NEXT_RUNTIME ?? null } },
        );

        return undefined;
    }

    return process.env[SAFE_API_KEY_ENV_VAR];
};

/**
 * Server-only: validates that the Safe API key is present in the environment. Throws when it is
 * missing, except in CI where the check is skipped so that unit tests can run without the real
 * secret. Used by `proxySafeUtils` to fail fast at server boot in misconfigured deployments.
 */
export const assertServerSafeConfig = (): void => {
    if (process.env.CI === 'true') {
        return;
    }

    if (process.env[SAFE_API_KEY_ENV_VAR]) {
        return;
    }

    throw new Error(
        `Missing Safe API key. Required env var: ${SAFE_API_KEY_ENV_VAR}`,
    );
};
