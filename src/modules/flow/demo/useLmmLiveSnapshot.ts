'use client';

// LMM_DEMO_HACK: lift the vendored `useStatus` topology+RPC reader out of the
// per-page `LmmPolicyTopology` and expose it as a global snapshot via the
// FlowDataProvider.  Two motivations:
//
//   1. KPI / Activity / Recipients on the overview page need the same
//      "what does the next dispatch look like" prediction the detail page
//      already shows — re-using the existing hook is the smallest possible
//      change.
//   2. Single poller per session: useStatus already de-dupes inside itself,
//      but we'd previously spin up an `inspect()` + a poll loop every time
//      `LmmPolicyTopology` mounted.  One snapshot driven from the provider
//      keeps the RPC churn predictable.
//
// Production removal: the snapshot fields below are 1-to-1 with what an
// `OrchestratorSnapshot` entity could surface from the indexer (per-strategy
// budget readings, gate.passes, cowSwap.ordersPlaced, simulate.steps).
// When the indexer emits that, this hook degrades to a thin selector over
// `IEnvioPolicy.strategies[].budget.snapshot` and the RPC + viem dependency
// can disappear.  See docs/lido-mmd-status.md `live-snapshot-rpc`.

import { useEffect, useRef, useState } from 'react';
import {
    type Address,
    createPublicClient,
    http,
    type PublicClient,
} from 'viem';
import { mainnet } from 'viem/chains';
import { inspect, type TopologyGraph } from '@/shared/lidoPreview';
import {
    type StatusSnapshot,
    useStatus,
} from '../components/lidoMoneyMachine/useStatus';
import { LMM_DEMO_MODE, LMM_RPC_URL } from './lmmDemoConfig';
import { useLmmManifest } from './useLmmManifest';

export type LmmLiveSnapshot = StatusSnapshot;

export interface IUseLmmLiveSnapshotResult {
    /** Dispatcher plugin address (manifest), used by selectors to attach
     *  the snapshot to the matching `IFlowPolicy`. */
    dispatcherAddress?: string;
    /** On-chain topology graph; null until `inspect()` resolves.  Re-exposed
     *  so downstream consumers (e.g. money-flow graph builder) don't have
     *  to re-run inspect themselves. */
    topology: TopologyGraph | null;
    /** Latest snapshot from `useStatus` — paused/budget/gate/simulate. */
    snapshot: LmmLiveSnapshot | null;
    /** `true` while we don't yet have a snapshot to render. */
    loading: boolean;
    /** Last error encountered while inspecting / polling. */
    error?: string;
}

// One PublicClient per session — Anvil's fork RPC is the same across renders.
let cachedClient: PublicClient | undefined;
const getClient = (): PublicClient => {
    if (cachedClient) {
        return cachedClient;
    }
    cachedClient = createPublicClient({
        chain: mainnet,
        transport: http(LMM_RPC_URL),
    });
    return cachedClient;
};

const EMPTY: IUseLmmLiveSnapshotResult = {
    dispatcherAddress: undefined,
    topology: null,
    snapshot: null,
    loading: false,
};

/**
 * Resolve the LMM topology + live snapshot, or return `EMPTY` outside demo
 * mode / before the manifest loads.
 */
export const useLmmLiveSnapshot = (): IUseLmmLiveSnapshotResult => {
    const { manifest } = useLmmManifest();
    const [topology, setTopology] = useState<TopologyGraph | null>(null);
    const [inspectError, setInspectError] = useState<string | undefined>(
        undefined,
    );
    const dispatcher = manifest?.lmm.dispatcherPlugin as Address | undefined;

    // Memoise dispatcher in a ref so the inspect effect depends only on
    // the string identity rather than the manifest object — Turbopack /
    // fast-refresh can churn the latter.
    const dispatcherRef = useRef<string | undefined>(dispatcher);
    dispatcherRef.current = dispatcher;

    useEffect(() => {
        if (!LMM_DEMO_MODE || dispatcher == null) {
            setTopology(null);
            return;
        }
        let cancelled = false;
        const run = async (): Promise<void> => {
            try {
                const result = await inspect(getClient(), dispatcher);
                if (!cancelled) {
                    setTopology(result);
                    setInspectError(undefined);
                }
            } catch (e) {
                if (!cancelled) {
                    setInspectError(e instanceof Error ? e.message : String(e));
                    setTopology(null);
                }
            }
        };
        void run();
        return () => {
            cancelled = true;
        };
    }, [dispatcher]);

    // useStatus self-disables when topology is null, so the polling loop
    // never runs outside demo mode.
    const { state } = useStatus(getClient, topology);

    if (!LMM_DEMO_MODE) {
        return EMPTY;
    }

    const snapshot = state.kind === 'ready' ? state.snapshot : null;
    const loading =
        topology == null || (state.kind === 'loading' && snapshot == null);
    const error =
        inspectError ?? (state.kind === 'error' ? state.message : undefined);

    return {
        dispatcherAddress: dispatcher,
        topology,
        snapshot,
        loading,
        error,
    };
};
