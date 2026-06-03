'use client';

/**
 * Focus layout — the single canvas display for the Money Machine flow. The
 * capital-flow graph goes full-bleed and every control floats over it as a
 * glass panel: flow selector + live badge (top-left), next-run + dispatch
 * controls + demo actions (top-center), this-flow stats + inspector (right
 * column), and a collapsible dispatch history (bottom-left).
 *
 * The canvas shows the UPCOMING dispatch (what the next dispatch will move),
 * not the last settled run — replay a past run from the history strip.
 */

import { Card } from '@aragon/gov-ui-kit';
import { useCallback, useEffect, useState } from 'react';
import type { IFlowGraph } from '../../canvas/flowGraphTypes';
import { LMM_RPC_URL } from '../../demo/lmmDemoConfig';
import { assertForkRpc } from '../../demo/safety';
import { useLmmActionContext } from '../../demo/useLmmActionContext';
import { dispatchAction } from '../lidoMoneyMachine/actions';
import './workbench.css';
import type { IFlowDescription } from './buildWorkbenchModel';
import { FlowCanvas } from './flowCanvas';
import { FlowDescriptionCard, TokenFlowList } from './flowInfoPanels';
import { MmIcon } from './mmIcon';
import { LiveBadge } from './mmPrimitives';
import { WorkbenchDemoActions } from './workbenchDemoActions';
import {
    CumulativeStats,
    DispatchControls,
    FlowSelector,
    NextRunSummary,
} from './workbenchHeader';
import type { IHistoryRun, IWorkbenchModel } from './workbenchModel';
import {
    HistoryStrip,
    Inspector,
    ReplayBanner,
    SimulateModal,
} from './workbenchPanels';

const GLASS =
    'rounded-2xl border border-neutral-100 bg-neutral-0/85 shadow-neutral-xl backdrop-blur-md';

export interface IFlowFocusProps {
    model: IWorkbenchModel;
    /** Graph for the current view (upcoming dispatch or the active replayed run). */
    graph: IFlowGraph | null;
    /** Human-language description of the flow (rendered as a canvas overlay). */
    description?: IFlowDescription;
    recipient?: { label: string; address?: string };
    /** Active replayed run (null = live upcoming-dispatch view). */
    activeRun: string | null;
    onReplay: (run: string) => void;
    onClearReplay: () => void;
    onSelectFlow: (id: string) => void;
    onDispatch: () => void;
    canDispatch: boolean;
    /** Why dispatch is disabled (tooltip on the disabled button). */
    dispatchReason?: string;
}

export const FlowFocus: React.FC<IFlowFocusProps> = (props) => {
    const {
        model,
        graph,
        description,
        recipient,
        activeRun,
        onReplay,
        onClearReplay,
        onSelectFlow,
        onDispatch,
        canDispatch,
        dispatchReason,
    } = props;

    const [selected, setSelected] = useState<string | null>(null);
    const [simOpen, setSimOpen] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);

    // In demo mode, dispatch the fork tx directly from this modal — no second
    // confirm dialog. Outside demo mode, fall back to the provider's dispatch
    // flow (wallet/review wizard).
    const demoCtx = useLmmActionContext();
    const handleDispatch = useCallback(() => {
        if (!demoCtx) {
            onDispatch();
            return;
        }
        (async () => {
            try {
                assertForkRpc();
                await dispatchAction(demoCtx);
            } catch (e) {
                // biome-ignore lint/suspicious/noConsole: demo presenter affordance
                console.error('[lmm-demo] dispatch failed:', e);
            }
        })();
    }, [demoCtx, onDispatch]);

    // biome-ignore lint/correctness/useExhaustiveDependencies: reset is keyed on the view identity
    useEffect(() => {
        setSelected(null);
    }, [model.selectedFlowId, activeRun]);

    const selectedNode = graph?.nodes.find((n) => n.id === selected) ?? null;
    const runForBanner: IHistoryRun | null =
        activeRun != null
            ? (model.history.find((h) => h.run === activeRun) ?? null)
            : null;

    return (
        <div className="mm-wb-root relative h-full overflow-hidden bg-neutral-50">
            {/* full-bleed canvas */}
            <div className="absolute inset-0">
                {graph ? (
                    <FlowCanvas
                        graph={graph}
                        onSelect={setSelected}
                        replaying={activeRun != null}
                        selected={selected}
                    />
                ) : (
                    <div className="flex size-full flex-col items-center justify-center gap-2 p-6 text-center">
                        <div className="font-semibold text-lg text-neutral-700">
                            Select a flow
                        </div>
                        <div className="max-w-[42ch] text-neutral-500 text-sm">
                            Pick a flow to see its capital-flow graph.
                        </div>
                    </div>
                )}
            </div>

            {/* top-left: flow selector + live badge, with the flow description
                stacked beneath it */}
            <div className="absolute top-4 left-4 z-20 flex w-[360px] flex-col gap-3">
                <div className={`flex items-center gap-2.5 p-2 ${GLASS}`}>
                    <FlowSelector
                        dao={model.dao}
                        flows={model.flows}
                        onChange={onSelectFlow}
                        value={model.selectedFlowId}
                    />
                    {model.isLive && <LiveBadge />}
                </div>
                {description && (
                    <FlowDescriptionCard
                        className={GLASS}
                        description={description}
                    />
                )}
            </div>

            {/* top-center: next-run + dispatch controls */}
            <div className="absolute top-4 left-1/2 z-20 -translate-x-1/2">
                <div
                    className={`flex items-center gap-3.5 px-3.5 py-2.5 ${GLASS}`}
                >
                    {model.nextRun && (
                        <NextRunSummary nextRun={model.nextRun} />
                    )}
                    {model.nextRun && (
                        <span className="h-[30px] w-px flex-shrink-0 bg-neutral-200" />
                    )}
                    <DispatchControls
                        canDispatch={canDispatch}
                        dispatchReason={dispatchReason}
                        onSimulate={() => setSimOpen(true)}
                    />
                    <WorkbenchDemoActions />
                </div>
                {runForBanner && (
                    <div className="mt-3 flex justify-center">
                        <ReplayBanner
                            onClear={onClearReplay}
                            run={runForBanner}
                        />
                    </div>
                )}
            </div>

            {/* right column: this-flow stats + inspector */}
            <div className="absolute top-4 right-4 bottom-4 z-20 flex w-[380px] flex-col gap-3.5 overflow-y-auto">
                {model.stats && (
                    <Card className={`flex-shrink-0 p-4 ${GLASS}`}>
                        <div className="mb-3 flex items-center justify-between">
                            <span className="font-semibold text-neutral-500 text-xs uppercase tracking-[0.07em]">
                                Cumulative
                            </span>
                            <span className="text-neutral-400 text-xs">
                                {model.stats.activeSinceDays}d
                            </span>
                        </div>
                        <CumulativeStats stats={model.stats} />
                        {model.stats.tokenFlows.length > 0 && (
                            <div className="mt-3.5 border-neutral-100 border-t pt-3">
                                <div className="mb-2 font-semibold text-neutral-400 text-xs uppercase tracking-[0.06em]">
                                    Token throughput
                                </div>
                                <TokenFlowList flows={model.stats.tokenFlows} />
                            </div>
                        )}
                    </Card>
                )}
                {selectedNode && (
                    <Inspector
                        node={selectedNode}
                        onClose={() => setSelected(null)}
                        recipient={recipient}
                    />
                )}
            </div>

            {/* bottom-left: collapsible dispatch history */}
            <div className="absolute bottom-4 left-4 z-20">
                {historyOpen ? (
                    <div
                        className={`w-[880px] max-w-[calc(100vw-2rem)] overflow-hidden ${GLASS}`}
                    >
                        <HistoryStrip
                            activeRun={activeRun}
                            history={model.history}
                            onClear={onClearReplay}
                            onCollapse={() => setHistoryOpen(false)}
                            onSelect={(run) =>
                                run === activeRun
                                    ? onClearReplay()
                                    : onReplay(run)
                            }
                        />
                    </div>
                ) : (
                    <button
                        className={`inline-flex items-center gap-2 px-3.5 py-2.5 font-semibold text-neutral-700 text-sm hover:text-neutral-900 ${GLASS}`}
                        onClick={() => setHistoryOpen(true)}
                        type="button"
                    >
                        <MmIcon name="app-transactions" size={15} />
                        History
                        <span className="rounded-full bg-neutral-100 px-[7px] py-px text-neutral-500 text-xs">
                            {model.history.length}
                        </span>
                        <MmIcon name="chevron-up" size={14} />
                    </button>
                )}
            </div>

            {simOpen && model.nextRun && (
                <SimulateModal
                    canDispatch={canDispatch}
                    demoRpc={demoCtx ? LMM_RPC_URL : undefined}
                    dispatchReason={dispatchReason}
                    nextRun={model.nextRun}
                    onClose={() => setSimOpen(false)}
                    onDispatch={handleDispatch}
                />
            )}
        </div>
    );
};
