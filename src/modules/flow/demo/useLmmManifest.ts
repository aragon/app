'use client';

// LMM_DEMO_HACK: React-only entry-point for the manifest loader.  The pure
// config exports (URLs, flags, types) live in `./lmmDemoConfig` so that
// server components can import them without dragging useEffect/useState
// into the RSC graph — Turbopack rejects that in Next 16.  This module is
// the one place where the demo's mutable client cache lives.
//
// Removal:
//   1. Delete this file together with ./lmmDemoConfig and ./lmmDaoOverride.
//   2. See docs/lido-mmd-production-readiness.md.

import { useEffect, useState } from 'react';
import {
    LMM_DEMO_MODE,
    LMM_MANIFEST_URL,
    type LmmManifest,
} from './lmmDemoConfig';

interface ManifestState {
    manifest: LmmManifest | undefined;
    error: Error | undefined;
    loading: boolean;
}

// Module-scope cache so every consumer that mounts before the first response
// shares the in-flight request, and subsequent mounts return synchronously.
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

/**
 * True when `policyAddress` matches the LMM demo dispatcher plugin from the
 * cached manifest.  Used by `FlowPolicyStructure` and the policy-detail
 * header to suppress the legacy "Structure breakdown" + USDC token chip in
 * favour of the rich `LmmPolicyTopology` + `StatusPanel` rendering.  Returns
 * `false` outside demo mode or before the manifest loads — callers that need
 * to wait for the manifest should pair this with `useLmmManifest().loading`.
 */
export const useIsLmmDispatcherPolicy = (
    policyAddress: string | undefined,
): boolean => {
    const { manifest } = useLmmManifest();
    if (!LMM_DEMO_MODE || !manifest || !policyAddress) {
        return false;
    }
    return (
        policyAddress.toLowerCase() ===
        manifest.lmm.dispatcherPlugin.toLowerCase()
    );
};
