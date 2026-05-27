// LMM_DEMO_HACK: client-side wrapper that renders the LMM topology + live
// state card.  Production builds NEVER mount this — the FlowPolicyTree
// route guards on isLmmDemoDao() before importing.
//
// The previous version owned its own `inspect()` + `useStatus` poll loop.
// We lifted both into `useLmmLiveSnapshot` (mounted from FlowDataProvider)
// so KPI / Activity / Topology share one subscription and one RPC poll
// per session.

'use client';

import classNames from 'classnames';
import type { Address } from 'viem';
import { LMM_RPC_URL } from '@/modules/flow/demo/lmmDemoConfig';
import { useLmmManifest } from '@/modules/flow/demo/useLmmManifest';
import { useFlowDataContext } from '@/modules/flow/providers/flowDataProvider';
import { StatusPanel } from './StatusPanel';
import { TopologyView } from './TopologyView';

interface ILmmPolicyTopologyProps {
    /** DispatcherPlugin address (i.e. the top-level multi-dispatch policy).
     *  Kept on the props for backwards-compatibility with callers; the
     *  effective address now lives on the manifest.  Treated as an
     *  assertion that the provider's snapshot belongs to this plugin. */
    pluginAddress: Address;
    /** Optional Lido DAO address rendered as a parent node above the LMM DAO. */
    lidoDaoAddress?: string;
    /** Optional address to pre-select in the topology — used by the dashboard
     *  orchestrator chip deep-link (`?node=<strategyAddress>`). */
    selectedNodeAddress?: string;
    className?: string;
}

export const LmmPolicyTopology: React.FC<ILmmPolicyTopologyProps> = (props) => {
    const { lidoDaoAddress, selectedNodeAddress, className } = props;
    const { liveSnapshot } = useFlowDataContext();
    const { manifest } = useLmmManifest();
    const topology = liveSnapshot?.topology ?? null;
    const statusSnapshot = liveSnapshot?.snapshot ?? undefined;
    const error = liveSnapshot?.error;

    if (error) {
        return (
            <div className={className}>
                <div className="rounded-xl border border-critical-200 bg-critical-50 p-4 text-critical-700">
                    Topology inspection failed: {error}
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
            className={classNames(
                // `items-stretch` is the default for grid; we rely on it so
                // the topology column matches the live-state column's height
                // exactly (the sidebar tends to be taller than the graph's
                // intrinsic min-height once Balances + Budgets + Conditions
                // are filled).
                'grid grid-cols-1 gap-4 lg:grid-cols-3 lg:items-stretch',
                className,
            )}
        >
            <div
                // The vendored `.topology` uses `flex: 1; min-height: 0` —
                // it only fills its parent when that parent is a flex column
                // with a measurable size.  `min-h-[520px]` gives mobile a
                // usable viewport; on `lg+` the grid row stretches us to
                // the sidebar's height so the canvas doesn't end before the
                // Live state cards do.
                className="flex min-h-[520px] flex-col lg:col-span-2 lg:h-full lg:min-h-[640px]"
            >
                <TopologyView
                    initialSelectedNodeAddress={selectedNodeAddress}
                    lidoDaoAddress={lidoDaoAddress}
                    manifest={manifest}
                    status={statusSnapshot}
                    topology={topology}
                />
            </div>
            <div className="lg:col-span-1">
                <StatusPanel snapshot={statusSnapshot} />
            </div>
        </div>
    );
};
