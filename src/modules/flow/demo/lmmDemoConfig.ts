// LMM_DEMO_HACK: demo-mode flags + manifest loader for the Lido Money Machine
// demo.  Everything in this file is a *temporary* short-circuit around the
// production Aragon backend / wagmi pipeline; remove the imports of this
// module to drop demo mode entirely.
//
// See `docs/lido-mmd-production-readiness.md` for the removal checklist.

import { useEffect, useState } from 'react';
import type { Address } from 'viem';

/** `1` when the build should expose the LMM demo affordances. */
export const LMM_DEMO_MODE: boolean =
    process.env.NEXT_PUBLIC_LMM_DEMO_MODE === '1' ||
    process.env.NEXT_PUBLIC_LMM_DEMO_MODE === 'true';

/**
 * URL the front-end fetches at boot to discover the demo DAO's addresses.
 * Produced by `just demo-up` in dao-launchpad@f/lido-demo and served by the
 * VM caddy at `https://<DOMAIN>/manifest.json`.  For local-first dev we
 * default to the dev server's `/lmm-manifest.json` (a symlink to
 * `dao-launchpad/lido/preview/script/demo/manifest.json`).
 */
export const LMM_MANIFEST_URL: string =
    process.env.NEXT_PUBLIC_LMM_MANIFEST_URL ?? '/lmm-manifest.json';

/**
 * Envio Hasura endpoint used in demo mode.  In local-first dev:
 *   http://localhost:8080/v1/graphql
 * On the VM:
 *   https://<DOMAIN>/graphql
 */
export const LMM_FLOW_INDEXER_ENDPOINT: string =
    process.env.NEXT_PUBLIC_FLOW_INDEXER_ENDPOINT ??
    'http://localhost:8080/v1/graphql';

/**
 * Anvil RPC used by the demo's cheat-action menu (anvil_setBalance,
 * evm_increaseTime).  This must point at the same node Envio is indexing.
 */
export const LMM_RPC_URL: string =
    process.env.NEXT_PUBLIC_LMM_RPC_URL ?? 'http://localhost:8545';

/**
 * Whitelist of hosts we'll let viem talk to in demo mode.  Used by
 * `assertForkRpc()` in safety.ts to block accidental writes against
 * real chains.
 */
export const LMM_RPC_ALLOWLIST = [
    'localhost',
    '127.0.0.1',
    // Production demo VM — adjust per environment.
    'lmm-demo.aragon-team.xyz',
];

// ---------------------------------------------------------------------------
// Manifest shape
// ---------------------------------------------------------------------------

export interface LmmManifest {
    /** Chain id the demo was deployed on (1 = anvil mainnet fork). */
    chainId: number;
    /** Aragon OSx + Capital Router deployment addresses. */
    aragon: {
        daoFactory: Address;
        pluginSetupProcessor: Address;
    };
    /** The Lido Money Machine DAO + its plugins. */
    lmm: {
        dao: Address;
        /** Top-level dispatcher plugin (multi-dispatch policy). */
        dispatcher: Address;
        /** Embedded strategies, in dispatch order. */
        strategies: Array<{
            address: Address;
            kind: 'WRAP' | 'UNIV2_LIQUIDITY' | 'GATED_COWSWAP' | string;
            label: string;
        }>;
        /** Optional: budget/gate/epoch addresses for each strategy. */
        primitives?: {
            budgets?: Array<{ address: Address; kind: string }>;
            gates?: Array<{ address: Address; kind: string }>;
            epochProviders?: Array<{ address: Address }>;
        };
    };
    /** Hardcoded DAO metadata served by the manifest (no IPFS for the demo). */
    metadata: {
        name: string;
        description: string;
        avatarUrl?: string;
        links?: Array<{ label: string; url: string }>;
    };
    /**
     * Fingerprint of the deployment.  We compare this against the indexer's
     * Dao.address on load — mismatches signal a stale manifest or wrong
     * indexer endpoint.  See safety.ts → manifestFingerprintCheck().
     */
    fingerprint?: string;
}

// ---------------------------------------------------------------------------
// React hook: load + cache the manifest
// ---------------------------------------------------------------------------

interface ManifestState {
    manifest: LmmManifest | undefined;
    error: Error | undefined;
    loading: boolean;
}

let cachedManifest: LmmManifest | undefined;
let inflight: Promise<LmmManifest> | undefined;

const fetchManifest = (): Promise<LmmManifest> => {
    if (cachedManifest) {
        return Promise.resolve(cachedManifest);
    }
    if (inflight) {
        return inflight;
    }

    inflight = fetch(LMM_MANIFEST_URL, { cache: 'no-store' })
        .then((r) => {
            if (!r.ok) {
                throw new Error(
                    `manifest ${r.status} from ${LMM_MANIFEST_URL}`,
                );
            }
            return r.json() as Promise<LmmManifest>;
        })
        .then((m) => {
            cachedManifest = m;
            inflight = undefined;
            return m;
        })
        .catch((e) => {
            inflight = undefined;
            throw e;
        });
    return inflight;
};

export const useLmmManifest = (): ManifestState => {
    const [state, setState] = useState<ManifestState>(() => ({
        manifest: cachedManifest,
        error: undefined,
        loading: !cachedManifest && LMM_DEMO_MODE,
    }));

    useEffect(() => {
        if (!LMM_DEMO_MODE) {
            return;
        }
        if (cachedManifest) {
            setState({
                manifest: cachedManifest,
                error: undefined,
                loading: false,
            });
            return;
        }
        let cancelled = false;
        fetchManifest()
            .then((manifest) => {
                if (!cancelled) {
                    setState({ manifest, error: undefined, loading: false });
                }
            })
            .catch((error: unknown) => {
                if (!cancelled) {
                    setState({
                        manifest: undefined,
                        error:
                            error instanceof Error
                                ? error
                                : new Error(String(error)),
                        loading: false,
                    });
                }
            });
        return () => {
            cancelled = true;
        };
    }, []);

    return state;
};

/** Synchronous read of the cached manifest (use after `useLmmManifest()` resolves). */
export const getCachedLmmManifest = (): LmmManifest | undefined =>
    cachedManifest;

/**
 * True when a DAO address points at the LMM demo DAO from the cached manifest.
 * Falls back to `false` when the manifest hasn't loaded yet — callers should
 * gate this with `useLmmManifest()` to wait for the load.
 */
export const isLmmDemoDao = (daoAddress: string | undefined): boolean => {
    if (!LMM_DEMO_MODE || !daoAddress) {
        return false;
    }
    const m = cachedManifest;
    if (!m) {
        return false;
    }
    return daoAddress.toLowerCase() === m.lmm.dao.toLowerCase();
};

/**
 * Variant for components that want to react to manifest loading.
 * Returns `undefined` while the manifest is still loading.
 */
export const useIsLmmDemoDao = (
    daoAddress: string | undefined,
): boolean | undefined => {
    const { manifest, loading } = useLmmManifest();
    if (!LMM_DEMO_MODE) {
        return false;
    }
    if (loading) {
        return undefined;
    }
    if (!manifest || !daoAddress) {
        return false;
    }
    return daoAddress.toLowerCase() === manifest.lmm.dao.toLowerCase();
};
