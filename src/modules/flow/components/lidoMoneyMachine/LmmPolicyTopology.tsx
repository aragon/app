// LMM_DEMO_HACK: client-side wrapper that runs the vendored preview-lib
// `inspect()` against the demo anvil fork and renders the result via the
// vendored React Flow TopologyView.  Production builds NEVER mount this:
// the FlowPolicyTree route guards on isLmmDemoDao() before importing.

'use client';

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
import { TopologyView } from './TopologyView';
import { useStatus } from './useStatus';

interface ILmmPolicyTopologyProps {
    /** DispatcherPlugin address (i.e. the top-level multi-dispatch policy). */
    pluginAddress: Address;
    /** Optional Lido DAO address rendered as a parent node above the LMM DAO. */
    lidoDaoAddress?: string;
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
    const { pluginAddress, lidoDaoAddress, className } = props;
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
    const { state: statusState } = useStatus(getClient, topology ?? null);
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
        <div
            className={className}
            // The vendored TopologyView measures its parent — give it a
            // viewport so React Flow can mount.  640px is a comfortable
            // dashboard height; the user can scroll inside if the graph
            // grows beyond that.
            style={{ height: 640, minHeight: 480 }}
        >
            <TopologyView
                lidoDaoAddress={lidoDaoAddress}
                status={statusSnapshot}
                topology={topology}
            />
        </div>
    );
};
