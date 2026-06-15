'use client';

// LMM_DEMO_HACK: the dispatcher's per-leg cooldown is enforced ON-CHAIN against
// `block.timestamp`, but the rest of the UI computes "is the cooldown done?"
// against the host wall-clock (`Date.now()`).  When the operator uses the
// cheats menu to warp anvil forward by 7+ days, anvil's clock jumps but the
// browser clock obviously doesn't — so the Dispatch button stays disabled
// even though the chain would happily accept a dispatch.  Polling anvil's
// HEAD block timestamp here lets the cooldown check use chain time instead
// of wall time, which is exactly what the on-chain side does.
//
// Production removal: drop this file (and its imports in flowDataProvider).
// Outside demo mode `chainNowMs` is always undefined and consumers fall back
// to Date.now(), so no production code path depends on it.

import { useEffect, useRef, useState } from 'react';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { LMM_DEMO_MODE, LMM_RPC_URL } from './lmmDemoConfig';

/**
 * Wall time (ms since epoch) is fixed; we re-poll on this cadence so warps
 * applied via the cheats menu propagate to the UI within a few seconds.
 */
const POLL_INTERVAL_MS = 5000;

/**
 * Drift threshold (ms) for the very first poll.  If anvil HEAD is within this
 * window of the host wall-clock we treat the fork as "not warped" and return
 * `undefined` so callers stay on `Date.now()` — that avoids a flicker on the
 * dispatch button right after first render of the LMM detail page.
 */
const NO_WARP_DRIFT_MS = 60_000;

/**
 * Process-wide cache so every consumer that mounts shares the same poller —
 * we don't want each `useFlowDataContext()` call site to spin up its own
 * 5s interval against the same RPC.
 */
let cachedChainNowMs: number | undefined;
let pollerStarted = false;
const listeners = new Set<(v: number | undefined) => void>();

const broadcast = (v: number | undefined): void => {
    cachedChainNowMs = v;
    for (const fn of listeners) {
        fn(v);
    }
};

const startPoller = (): void => {
    if (pollerStarted) {
        return;
    }
    pollerStarted = true;

    const client = createPublicClient({
        chain: mainnet,
        transport: http(LMM_RPC_URL),
    });

    const tick = async (): Promise<void> => {
        try {
            const block = await client.getBlock({ blockTag: 'latest' });
            const chainMs = Number(block.timestamp) * 1000;
            const wallMs = Date.now();
            // Only override Date.now() once the fork has drifted meaningfully —
            // fresh deployments where anvil ≈ wall time should keep using the
            // host clock so the cooldown ring animation stays smooth.
            if (Math.abs(chainMs - wallMs) >= NO_WARP_DRIFT_MS) {
                broadcast(chainMs);
            } else if (cachedChainNowMs != null) {
                // Already overridden once — keep tracking even if we drift
                // back near the wall clock (operator may reset the fork).
                broadcast(chainMs);
            }
        } catch (e) {
            // Silently ignore — the LMM RPC may be momentarily unreachable
            // (operator restarting anvil).  Consumers fall back to Date.now()
            // until the next successful poll.
            // biome-ignore lint/suspicious/noConsole: surface RPC hiccups in demo mode for debugging
            console.warn('[useLmmChainNow] poll failed:', e);
        }
    };

    void tick();
    setInterval(() => {
        void tick();
    }, POLL_INTERVAL_MS);
};

/**
 * Returns the latest known anvil block timestamp (ms), or `undefined` when:
 *   - LMM demo mode is off, OR
 *   - the first poll hasn't completed yet, OR
 *   - the fork's clock is within {@link NO_WARP_DRIFT_MS} of the wall clock.
 *
 * Consumers should fall back to `Date.now()` on `undefined`.
 */
export const useLmmChainNow = (): { chainNowMs: number | undefined } => {
    const [chainNowMs, setChainNowMs] = useState<number | undefined>(
        cachedChainNowMs,
    );
    const listenerRef = useRef<(v: number | undefined) => void>(setChainNowMs);
    listenerRef.current = setChainNowMs;

    useEffect(() => {
        if (!LMM_DEMO_MODE) {
            return;
        }
        startPoller();
        const fn = (v: number | undefined): void => listenerRef.current(v);
        listeners.add(fn);
        if (cachedChainNowMs != null) {
            setChainNowMs(cachedChainNowMs);
        }
        return () => {
            listeners.delete(fn);
        };
    }, []);

    return { chainNowMs };
};

/**
 * Returns the "effective now" ms for cooldown / status comparisons:
 *   - `chainNowMs` when the LMM fork is warped, OR
 *   - `Date.now()` everywhere else.
 *
 * Read-once helper for non-React call sites (e.g. selectors).  React
 * consumers should prefer the hook above so they re-render on warp.
 */
export const getEffectiveNowMs = (): number => cachedChainNowMs ?? Date.now();
