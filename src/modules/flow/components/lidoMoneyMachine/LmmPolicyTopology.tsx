// LMM_DEMO_HACK: client-side wrapper that runs the vendored preview-lib
// `inspect()` against the demo anvil fork and renders the result via the
// vendored React Flow TopologyView.  Production builds NEVER mount this:
// the FlowPolicyTree route guards on isLmmDemoDao() before importing.

'use client';

import classNames from 'classnames';
import { useEffect, useState } from 'react';
import {
    type Address,
    createPublicClient,
    http,
    type PublicClient,
} from 'viem';
import { mainnet } from 'viem/chains';
import { LMM_RPC_URL } from '@/modules/flow/demo/lmmDemoConfig';
import { inspect, type TopologyGraph } from '@/shared/lidoPreview';
import { StatusPanel } from './StatusPanel';
import { TopologyView } from './TopologyView';
import { useStatus } from './useStatus';

interface ILmmPolicyTopologyProps {
    /** DispatcherPlugin address (i.e. the top-level multi-dispatch policy). */
    pluginAddress: Address;
    /** Optional Lido DAO address rendered as a parent node above the LMM DAO. */
    lidoDaoAddress?: string;
    /** Optional address to pre-select in the topology — used by the dashboard
     *  orchestrator chip deep-link (`?node=<strategyAddress>`). */
    selectedNodeAddress?: string;
    className?: string;
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

export const LmmPolicyTopology: React.FC<ILmmPolicyTopologyProps> = (props) => {
    const { pluginAddress, lidoDaoAddress, selectedNodeAddress, className } =
        props;
    const [topology, setTopology] = useState<TopologyGraph | undefined>(
        undefined,
    );
    const [error, setError] = useState<Error | undefined>(undefined);

    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            try {
                const client = getClient();
                const result = await inspect(client, pluginAddress);
                if (!cancelled) {
                    setTopology(result);
                }
            } catch (e) {
                if (!cancelled) {
                    setError(e instanceof Error ? e : new Error(String(e)));
                }
            }
        };
        void run();
        return () => {
            cancelled = true;
        };
    }, [pluginAddress]);

    // Live status (budget amounts, paused flags, gate readings) — polled by
    // the vendored useStatus hook against the same RPC.  useStatus expects a
    // client factory (it constructs its own retries) and a nullable topology.
    // The hook's own snapshot powers two surfaces: the in-graph node labels
    // (via `status` on TopologyView) and the StatusPanel cards rendered below.
    const { state: statusState, refresh: refreshStatus } = useStatus(
        getClient,
        topology ?? null,
    );
    const statusSnapshot =
        statusState.kind === 'ready' ? statusState.snapshot : undefined;

    if (error) {
        return (
            <div className={className}>
                <div className="rounded-xl border border-critical-200 bg-critical-50 p-4 text-critical-700">
                    Topology inspection failed: {error.message}
                </div>
            </div>
        );
    }

    if (!topology) {
        return (
            <div className={className}>
                <div className="rounded-xl border border-neutral-100 bg-neutral-0 p-6 text-neutral-500">
                    Loading topology from {LMM_RPC_URL}…
                </div>
            </div>
        );
    }

    return (
        <div className={classNames('flex flex-col gap-4', className)}>
            <div
                // The vendored `.topology` uses `flex: 1; min-height: 0` —
                // it only fills its parent when that parent is a flex column
                // with a measurable size.  Without `flex flex-col` here the
                // ReactFlow viewport collapses to 0×0 and the graph stays
                // blank (the parent still reserves 640px, so it looks like
                // an empty hole).  Set both so React Flow can mount.
                className="flex min-h-[480px] flex-col"
                style={{ height: 640 }}
            >
                <TopologyView
                    initialSelectedNodeAddress={selectedNodeAddress}
                    lidoDaoAddress={lidoDaoAddress}
                    status={statusSnapshot}
                    topology={topology}
                />
            </div>
            {/* Live cards: LMM DAO balances, Lido DAO LP, Budgets per
             *  dispatch, Stream remaining, PriceFloor gate status, CowSwap
             *  order count.  Mirrors the bottom panel of the preview UI at
             *  localhost:5173 so the in-app deep-dive matches the live demo.
             *  StatusPanel manages its own resizable height. */}
            <StatusPanel onRefresh={refreshStatus} state={statusState} />
        </div>
    );
};
