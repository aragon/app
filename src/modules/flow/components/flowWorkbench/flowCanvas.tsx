'use client';

/**
 * FlowCanvas — the workbench hero. A fixed-coordinate stage (sized by the
 * layout engine) that auto-fits its container; absolutely-positioned node
 * modules + an SVG edge layer with fidelity-aware styling and a single
 * travelling dot per active edge.
 *
 * Pure presentation over a positioned {@link IFlowGraph}: it reads node
 * geometry (x/y/w/h) and edge fidelity/state, and knows nothing about how the
 * graph was built (live snapshot vs. replayed run). Styled with Tailwind on
 * kit tokens; SVG strokes reference the kit's `--color-*` CSS variables.
 */

import classNames from 'classnames';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
    FlowFidelity,
    IFlowGraph,
    IFlowGraphEdge,
    IFlowGraphNode,
    IFlowNetEntry,
    IFlowSubInput,
} from '../../canvas/flowGraphTypes';
import {
    getRecipientDisplay,
    getSourceDisplay,
    getStrategyDisplay,
    getSubInputDisplay,
} from '../../canvas/primitiveRegistry';
import { MmIcon } from './mmIcon';
import { Amount, Pill } from './mmPrimitives';
import { MM_STATES, toneAccentBorder, toneChip, tonePulseVar } from './tone';

const REDUCED =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

type Side = 'left' | 'right';

interface IPoint {
    x: number;
    y: number;
}

interface IEdgeAnchors {
    a: IPoint;
    b: IPoint;
    aSide: Side;
    bSide: Side;
}

const centerY = (node: IFlowGraphNode): number => node.y + node.h / 2;
const centerX = (node: IFlowGraphNode): number => node.x + node.w / 2;

/**
 * The vertical band a node exposes connection anchors along, per side. Legs keep
 * anchors near the card header (above the hanging sub-inputs); the vault and
 * recipient spread anchors across their full height so the hub's many spokes
 * fan out instead of piling onto one point.
 */
const anchorBand = (node: IFlowGraphNode): { top: number; bottom: number } =>
    node.kind === 'strategy'
        ? { top: node.y + 14, bottom: node.y + 58 }
        : { top: node.y + 24, bottom: node.y + node.h - 24 };

/** Extra spacing (in slot units) inserted between one leg's anchor group and
 *  the next, so the hub's spokes read as per-strategy clusters, not one wall. */
const CLUSTER_GAP = 1;

/** Direction-aware cubic between two side anchors so the curve always exits a
 *  node away from its body and re-enters the target cleanly — works for the
 *  rightward feeds, the leftward `returns` loop, and outbound distributes. */
const edgePath = (anchors: IEdgeAnchors): string => {
    const { a, b, aSide, bSide } = anchors;
    const dx = Math.max(48, Math.abs(b.x - a.x) * 0.5);
    const c1x = a.x + (aSide === 'right' ? dx : -dx);
    const c2x = b.x + (bSide === 'right' ? dx : -dx);
    return `M ${a.x} ${a.y} C ${c1x} ${a.y}, ${c2x} ${b.y}, ${b.x} ${b.y}`;
};

/** Consumed (vault→leg) anchors sort above produced (leg→vault / →recipient). */
const edgeGroup = (edge: IFlowGraphEdge): number =>
    edge.kind === 'feeds' ? 0 : 1;

interface IEnd {
    edgeId: string;
    end: 'a' | 'b';
    side: Side;
    group: number;
    /** The node at the other end — anchors are clustered per partner. */
    partnerId: string;
    partnerY: number;
}

/**
 * Resolve every edge's two endpoint anchors. Sides are geometric (an endpoint
 * always faces its partner). Anchors sharing a (node, side) are grouped by the
 * partner they connect to — so each leg's draw-from and return-to arrows sit
 * together as one cluster, clusters order by the partner's vertical position,
 * and a gap is left between clusters so the hub's spokes read per-strategy
 * instead of as one dense wall.
 */
const resolveAnchors = (
    nodes: IFlowGraphNode[],
    edges: IFlowGraphEdge[],
): Map<string, IEdgeAnchors> => {
    const byId = new Map(nodes.map((n) => [n.id, n]));
    // (nodeId|side) → ends touching it.
    const buckets = new Map<string, IEnd[]>();
    const push = (
        node: IFlowGraphNode,
        side: Side,
        e: Omit<IEnd, 'side'>,
    ): void => {
        const key = `${node.id}|${side}`;
        const list = buckets.get(key);
        const entry = { ...e, side };
        if (list) {
            list.push(entry);
        } else {
            buckets.set(key, [entry]);
        }
    };

    for (const edge of edges) {
        const from = byId.get(edge.source);
        const to = byId.get(edge.target);
        if (!(from && to)) {
            continue;
        }
        // Each endpoint faces the other node.
        const aSide: Side = centerX(to) >= centerX(from) ? 'right' : 'left';
        const bSide: Side = aSide === 'right' ? 'left' : 'right';
        const group = edgeGroup(edge);
        push(from, aSide, {
            edgeId: edge.id,
            end: 'a',
            group,
            partnerId: to.id,
            partnerY: centerY(to),
        });
        push(to, bSide, {
            edgeId: edge.id,
            end: 'b',
            group,
            partnerId: from.id,
            partnerY: centerY(from),
        });
    }

    const result = new Map<string, IEdgeAnchors>();
    const ensure = (id: string): IEdgeAnchors => {
        const existing = result.get(id);
        if (existing) {
            return existing;
        }
        const fresh: IEdgeAnchors = {
            a: { x: 0, y: 0 },
            b: { x: 0, y: 0 },
            aSide: 'right',
            bSide: 'left',
        };
        result.set(id, fresh);
        return fresh;
    };

    for (const [key, ends] of buckets) {
        const [nodeId, side] = key.split('|') as [string, Side];
        const node = byId.get(nodeId);
        if (!node) {
            continue;
        }
        // Cluster ends by partner; order clusters by the partner's height; keep
        // draw-from (feeds) above return-to (returns) inside each cluster.
        const clusterY = new Map<string, number>();
        for (const e of ends) {
            const cur = clusterY.get(e.partnerId);
            if (cur == null || e.partnerY < cur) {
                clusterY.set(e.partnerId, e.partnerY);
            }
        }
        ends.sort((p, q) => {
            const cp = clusterY.get(p.partnerId) ?? 0;
            const cq = clusterY.get(q.partnerId) ?? 0;
            if (cp !== cq) {
                return cp - cq;
            }
            if (p.partnerId !== q.partnerId) {
                return p.partnerId < q.partnerId ? -1 : 1;
            }
            return p.group - q.group;
        });

        // Slot positions with an extra gap whenever the cluster changes.
        const slots: number[] = [];
        let cursor = 0;
        ends.forEach((e, i) => {
            if (i > 0 && e.partnerId !== ends[i - 1]?.partnerId) {
                cursor += CLUSTER_GAP;
            }
            slots.push(cursor);
            cursor += 1;
        });
        const total = cursor; // includes the trailing slot's width
        const { top, bottom } = anchorBand(node);
        const x = side === 'right' ? node.x + node.w : node.x;
        ends.forEach((e, i) => {
            const y =
                total <= 1
                    ? (top + bottom) / 2
                    : top + (((slots[i] ?? 0) + 0.5) / total) * (bottom - top);
            const anchors = ensure(e.edgeId);
            anchors[e.end] = { x, y };
            if (e.end === 'a') {
                anchors.aSide = side;
            } else {
                anchors.bSide = side;
            }
        });
    }

    return result;
};

const edgeColor = (edge: IFlowGraphEdge, replaying: boolean): string => {
    if (edge.blocked) {
        return 'var(--color-critical-400)';
    }
    if (replaying) {
        return 'var(--color-neutral-200)';
    }
    if (edge.fidelity === 'opaque') {
        return 'var(--color-primary-200)';
    }
    return 'var(--color-primary-300)';
};

const dashFor = (fidelity: FlowFidelity): string | undefined => {
    if (fidelity === 'estimated') {
        return '7 6';
    }
    if (fidelity === 'opaque') {
        return '2 6';
    }
    return undefined;
};

interface IView {
    k: number;
    x: number;
    y: number;
}

const MIN_K = 0.2;
const MAX_K = 2.5;
const clampK = (k: number): number => Math.min(MAX_K, Math.max(MIN_K, k));

/**
 * Pan + zoom over the fixed-coordinate stage. The stage starts fitted &
 * centred (the previous auto-fit behaviour); after that the user can scroll to
 * zoom toward the cursor and drag the background to pan. Re-fits automatically
 * only while the user hasn't interacted yet (so a flow/run switch still frames
 * the graph), and on explicit reset.
 */
const usePanZoom = (
    ref: React.RefObject<HTMLDivElement | null>,
    stageW: number,
    stageH: number,
) => {
    const [view, setView] = useState<IView>({ k: 1, x: 0, y: 0 });
    const interacted = useRef(false);

    const fit = useCallback((): IView | null => {
        const el = ref.current;
        if (!el || stageW === 0 || stageH === 0) {
            return null;
        }
        const cw = el.clientWidth;
        const ch = el.clientHeight;
        if (!(cw && ch)) {
            return null;
        }
        const k = clampK(Math.min(cw / stageW, ch / stageH, 1));
        return { k, x: (cw - stageW * k) / 2, y: (ch - stageH * k) / 2 };
    }, [ref, stageW, stageH]);

    const reset = useCallback(() => {
        const next = fit();
        if (next) {
            interacted.current = false;
            setView(next);
        }
    }, [fit]);

    // (Re)fit until the user takes over, and keep the fit responsive to resizes.
    // biome-ignore lint/correctness/useExhaustiveDependencies: re-fit when the stage size changes
    useEffect(() => {
        const el = ref.current;
        if (!el) {
            return;
        }
        const apply = () => {
            if (interacted.current) {
                return;
            }
            const next = fit();
            if (next) {
                setView(next);
            }
        };
        apply();
        const raf = requestAnimationFrame(apply);
        const ro = new ResizeObserver(apply);
        ro.observe(el);
        return () => {
            ro.disconnect();
            cancelAnimationFrame(raf);
        };
    }, [fit, stageW, stageH]);

    const zoomAt = useCallback((factor: number, px: number, py: number) => {
        setView((v) => {
            const k = clampK(v.k * factor);
            if (k === v.k) {
                return v;
            }
            // Keep the stage point under (px,py) fixed across the zoom.
            const wx = (px - v.x) / v.k;
            const wy = (py - v.y) / v.k;
            return { k, x: px - wx * k, y: py - wy * k };
        });
        interacted.current = true;
    }, []);

    return { view, setView, reset, zoomAt, interacted };
};

/* ---------------------------------------------------------------- SubChip */

const SubChip: React.FC<{ sub: IFlowSubInput; muted: boolean }> = ({
    sub,
    muted,
}) => {
    const display = getSubInputDisplay(sub.role, sub.kind);
    const closed = sub.role === 'gate' && sub.status === 'closed';
    const open = sub.role === 'gate' && sub.status === 'open';
    return (
        <div
            className={classNames(
                'flex items-center gap-2 rounded-lg border px-[9px] py-1.5',
                closed && 'border-critical-200 bg-critical-100',
                open && 'border-success-200 bg-success-100',
                !(closed || open) && 'border-neutral-100 bg-neutral-50',
                muted && 'opacity-50',
            )}
        >
            <span
                className={classNames(
                    'flex size-5 shrink-0 items-center justify-center rounded border bg-neutral-0',
                    closed && 'border-critical-200 text-critical-600',
                    open && 'border-success-200 text-success-700',
                    !(closed || open) && 'border-neutral-100 text-neutral-400',
                )}
            >
                <MmIcon name={display.icon} size={14} />
            </span>
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 font-semibold text-neutral-600 text-xs">
                    {sub.label}
                    {closed && <Pill tone="critical">closed</Pill>}
                    {open && <Pill tone="success">open</Pill>}
                </div>
                {sub.note && (
                    <div className="mt-px text-[11px] text-neutral-400 leading-[1.35]">
                        {sub.note}
                    </div>
                )}
                {sub.detail && (
                    <div
                        className={classNames(
                            'mt-px text-[11px] leading-[1.35]',
                            closed ? 'text-critical-700' : 'text-neutral-400',
                        )}
                    >
                        {sub.detail}
                    </div>
                )}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-px">
                {sub.reading != null && (
                    <Amount amount={sub.reading} token={sub.token} />
                )}
                {sub.role === 'epoch' && sub.epoch != null && (
                    <span className="num font-semibold text-[11px] text-neutral-500">
                        #{sub.epoch.toLocaleString('en-US')}
                        {sub.epochLength ? ` · ${sub.epochLength}` : ''}
                    </span>
                )}
            </div>
        </div>
    );
};

/* ----------------------------------------------------------- StrategyModule */

const StrategyModule: React.FC<{
    node: IFlowGraphNode;
    selected: boolean;
    replaying: boolean;
    onSelect: (id: string) => void;
}> = ({ node, selected, replaying, onSelect }) => {
    const state = MM_STATES[node.state];
    const display = node.primitiveKind
        ? getStrategyDisplay(node.primitiveKind)
        : { icon: 'blockchain-smartcontract' };
    const pulse =
        !(REDUCED || replaying) &&
        (node.state === 'accumulating' ||
            node.state === 'blocked' ||
            node.state === 'firing');

    return (
        <div
            className="absolute z-[3]"
            style={{ left: node.x, top: node.y, width: node.w }}
        >
            <button
                className={classNames(
                    'relative flex w-full flex-col gap-1.5 rounded-2xl border border-neutral-200 border-l-[3px] bg-neutral-0 px-3.5 py-3 text-left shadow-neutral-md transition-shadow',
                    toneAccentBorder[state.tone],
                    selected
                        ? 'border-primary-400 ring-[3px] ring-primary-100'
                        : 'hover:shadow-neutral-lg',
                    pulse && 'mm-pulse',
                )}
                onClick={() => onSelect(node.id)}
                style={
                    pulse
                        ? ({
                              '--mm-pulse': tonePulseVar[state.tone],
                          } as React.CSSProperties)
                        : undefined
                }
                type="button"
            >
                <span className="flex items-center gap-2">
                    <span
                        className={classNames(
                            'flex size-[30px] shrink-0 items-center justify-center rounded-lg',
                            toneChip[state.tone],
                        )}
                    >
                        <MmIcon name={display.icon} size={18} />
                    </span>
                    <span className="min-w-0 flex-1 truncate font-semibold text-[15px] text-neutral-900">
                        {node.title}
                    </span>
                </span>
                <span className="flex items-center justify-between gap-2 pl-[38px]">
                    {node.subtitle && (
                        <span className="min-w-0 flex-1 truncate text-[11px] text-neutral-500">
                            {node.subtitle}
                        </span>
                    )}
                    {/* Status + (optional) reason badge sit together in the
                        header — keeping the card↔sub-node connector below clean
                        and the badge the same size as the status pill. */}
                    <span className="flex shrink-0 items-center gap-1.5">
                        {node.badge && (
                            <Pill tone={state.tone}>{node.badge}</Pill>
                        )}
                        <Pill tone={state.tone}>{state.label}</Pill>
                    </span>
                </span>
            </button>

            {node.inputs.length > 0 && (
                <div className="flex flex-col items-stretch px-[22px]">
                    {node.inputs.map((sub) => {
                        const closed =
                            sub.role === 'gate' && sub.status === 'closed';
                        return (
                            <div
                                className="flex flex-col items-stretch"
                                key={`${sub.role}:${sub.kind}:${sub.label}`}
                            >
                                <span
                                    className={classNames(
                                        'h-[11px] w-0.5 shrink-0 self-center',
                                        closed
                                            ? 'bg-critical-300'
                                            : 'bg-neutral-200',
                                    )}
                                />
                                <SubChip muted={replaying} sub={sub} />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

/* -------------------------------------------------------------- NetToVault */

/** Per-token net delta landing back in the DAO after the dispatch — the value
 *  the old inferred-pipeline model used to hide. `+` = produced back to the
 *  vault, `−` = drawn out; opaque contributors render as a `~` estimate. */
const NetToVault: React.FC<{ net?: IFlowNetEntry[] }> = ({ net }) => {
    if (!net || net.length === 0) {
        return null;
    }
    return (
        <div className="flex flex-col gap-1 border-neutral-100 border-t pt-2">
            <span className="font-semibold text-[10px] text-neutral-400 uppercase tracking-wide">
                Net this dispatch
            </span>
            {net.map((entry) => {
                const positive = entry.delta >= 0;
                const pending = entry.opaque && entry.delta === 0;
                return (
                    <div
                        className="flex items-baseline justify-between gap-2.5"
                        key={entry.token}
                    >
                        <span className="font-semibold text-neutral-500 text-xs">
                            {entry.token}
                        </span>
                        {pending ? (
                            <span className="font-semibold text-neutral-400 text-xs">
                                pending
                            </span>
                        ) : (
                            <span
                                className={classNames(
                                    'num font-semibold text-xs',
                                    positive
                                        ? 'text-success-700'
                                        : 'text-critical-700',
                                )}
                            >
                                {positive ? '+' : '−'}
                                {entry.opaque ? '~' : ''}
                                {Math.abs(entry.delta).toLocaleString('en-US', {
                                    maximumFractionDigits: 4,
                                })}
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

/* ------------------------------------------------------------- EndpointCard */

const EndpointCard: React.FC<{
    node: IFlowGraphNode;
    selected: boolean;
    onSelect: (id: string) => void;
}> = ({ node, selected, onSelect }) => {
    const isSource = node.kind === 'source';
    const display = isSource ? getSourceDisplay() : getRecipientDisplay();
    return (
        <button
            className={classNames(
                'absolute z-[3] flex flex-col gap-2 rounded-2xl border border-neutral-200 bg-neutral-0 p-3.5 text-left shadow-neutral-sm transition-shadow hover:shadow-neutral-md',
                selected && 'border-primary-400 ring-[3px] ring-primary-100',
            )}
            onClick={() => onSelect(node.id)}
            style={{
                left: node.x,
                top: node.y,
                width: node.w,
                // Render at the full layout height so the hub's spokes always
                // anchor on the card, never below it.
                minHeight: node.h,
            }}
            type="button"
        >
            <div className="flex items-center gap-2 font-semibold text-neutral-900 text-sm">
                <span className="text-neutral-500">
                    <MmIcon name={display.icon} size={16} />
                </span>
                <span className="min-w-0 flex-1 truncate">{node.title}</span>
            </div>
            <Pill
                className="self-start"
                tone={isSource ? 'neutral' : 'primary'}
            >
                {isSource ? 'DAO vault · funds & receives' : 'Recipient'}
            </Pill>
            {isSource ? (
                <>
                    <div className="flex flex-col gap-1.5">
                        {(node.balances ?? []).map((b) => (
                            <div
                                className="flex items-baseline justify-between gap-2.5 rounded-lg bg-neutral-50 px-[9px] py-[5px]"
                                key={b.token}
                            >
                                <span className="font-semibold text-neutral-500 text-xs">
                                    {b.token}
                                </span>
                                <Amount
                                    amount={b.amount}
                                    showToken={false}
                                    token={b.token}
                                />
                            </div>
                        ))}
                    </div>
                    <NetToVault net={node.net} />
                </>
            ) : (
                node.address && (
                    <div className="mono rounded-lg bg-neutral-50 px-[9px] py-[5px] text-neutral-600 text-xs">
                        {node.address.length > 12
                            ? `${node.address.slice(0, 6)}…${node.address.slice(-4)}`
                            : node.address}
                    </div>
                )
            )}
        </button>
    );
};

/* --------------------------------------------------------------- EdgeLabel */

const EdgeLabel: React.FC<{
    edge: IFlowGraphEdge;
    mid: IPoint;
    replaying: boolean;
}> = ({ edge, mid, replaying }) => (
    <div
        className={classNames(
            'absolute z-[4] inline-flex translate-x-[-50%] translate-y-[-50%] items-center gap-1.5 whitespace-nowrap rounded-full border bg-neutral-0 px-2.5 py-[3px] text-xs shadow-neutral-sm',
            edge.fidelity === 'estimated' && 'border-info-200',
            edge.fidelity === 'opaque' && 'border-primary-200 border-dashed',
            edge.fidelity === 'real' && 'border-neutral-200',
            edge.blocked && 'border-critical-300',
            replaying && 'opacity-45',
        )}
        style={{ left: mid.x, top: mid.y }}
    >
        <Amount
            amount={edge.amount ?? null}
            fidelity={edge.fidelity}
            token={edge.token}
        />
        {edge.perEpoch && (
            <span className="font-semibold text-neutral-400">/epoch</span>
        )}
        {edge.blocked && (
            <span className="inline-flex items-center gap-[3px] font-semibold text-critical-700">
                <span className="text-critical-500">
                    <MmIcon name="gate" size={11} />
                </span>
                blocked
            </span>
        )}
    </div>
);

/* --------------------------------------------------------------- FlowCanvas */

export interface IFlowCanvasProps {
    graph: IFlowGraph;
    selected: string | null;
    onSelect: (id: string | null) => void;
    /** True when the graph represents a replayed historical run. */
    replaying: boolean;
}

export const FlowCanvas: React.FC<IFlowCanvasProps> = (props) => {
    const { graph, selected, onSelect, replaying } = props;
    const wrapRef = useRef<HTMLDivElement>(null);
    const { view, setView, reset, zoomAt, interacted } = usePanZoom(
        wrapRef,
        graph.width,
        graph.height,
    );
    // Drag-to-pan from the background (not from a node/button, so clicks select).
    const pan = useRef<{ x: number; y: number } | null>(null);
    const [panning, setPanning] = useState(false);

    const anchors = useMemo(
        () => resolveAnchors(graph.nodes, graph.edges),
        [graph.nodes, graph.edges],
    );

    const onWheel = (e: React.WheelEvent) => {
        const el = wrapRef.current;
        if (!el) {
            return;
        }
        const rect = el.getBoundingClientRect();
        const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
        zoomAt(factor, e.clientX - rect.left, e.clientY - rect.top);
    };
    const onPointerDown = (e: React.PointerEvent) => {
        // Only pan when the drag starts on empty canvas, never on a node.
        if ((e.target as HTMLElement).closest('button')) {
            return;
        }
        pan.current = { x: e.clientX, y: e.clientY };
        setPanning(true);
        interacted.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e: React.PointerEvent) => {
        if (!pan.current) {
            return;
        }
        const dx = e.clientX - pan.current.x;
        const dy = e.clientY - pan.current.y;
        pan.current = { x: e.clientX, y: e.clientY };
        setView((v) => ({ ...v, x: v.x + dx, y: v.y + dy }));
    };
    const endPan = () => {
        pan.current = null;
        setPanning(false);
    };

    return (
        <div
            className={classNames(
                'relative size-full touch-none overflow-hidden bg-neutral-50',
                panning ? 'cursor-grabbing' : 'cursor-grab',
            )}
            onPointerDown={onPointerDown}
            onPointerLeave={endPan}
            onPointerMove={onPointerMove}
            onPointerUp={endPan}
            onWheel={onWheel}
            ref={wrapRef}
        >
            <div
                className="absolute top-0 left-0 origin-top-left"
                style={{
                    width: graph.width,
                    height: graph.height,
                    transform: `translate(${view.x}px, ${view.y}px) scale(${view.k})`,
                }}
            >
                <div className="mm-grid" />

                <svg
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 z-[2] overflow-visible"
                    height={graph.height}
                    viewBox={`0 0 ${graph.width} ${graph.height}`}
                    width={graph.width}
                >
                    <defs>
                        {graph.edges.map((e) => {
                            const c = edgeColor(e, replaying);
                            return (
                                <marker
                                    id={`mm-arrow-${e.id}`}
                                    key={`m-${e.id}`}
                                    markerHeight="9"
                                    markerWidth="9"
                                    orient="auto"
                                    refX="6"
                                    refY="4.5"
                                >
                                    <path d="M1 1 L7 4.5 L1 8 Z" fill={c} />
                                </marker>
                            );
                        })}
                    </defs>
                    {graph.edges.map((e) => {
                        const anchor = anchors.get(e.id);
                        if (!anchor) {
                            return null;
                        }
                        const d = edgePath(anchor);
                        const c = edgeColor(e, replaying);
                        const flowDot =
                            e.flowing && !e.blocked && !replaying && !REDUCED;
                        return (
                            <g key={e.id}>
                                <path
                                    d={d}
                                    fill="none"
                                    markerEnd={`url(#mm-arrow-${e.id})`}
                                    opacity={replaying ? 0.5 : 1}
                                    stroke={c}
                                    strokeDasharray={
                                        e.blocked ? '6 5' : dashFor(e.fidelity)
                                    }
                                    strokeLinecap="round"
                                    strokeWidth={
                                        e.flowing && !e.blocked ? 2.5 : 2
                                    }
                                />
                                {flowDot && (
                                    <circle
                                        className="mm-flow-dot"
                                        fill={
                                            e.fidelity === 'opaque'
                                                ? 'var(--color-primary-300)'
                                                : 'var(--color-primary-500)'
                                        }
                                        r={e.fidelity === 'opaque' ? 3.5 : 4.5}
                                    >
                                        <animateMotion
                                            dur={
                                                e.fidelity === 'opaque'
                                                    ? '3s'
                                                    : '2.4s'
                                            }
                                            path={d}
                                            repeatCount="indefinite"
                                        />
                                    </circle>
                                )}
                            </g>
                        );
                    })}
                </svg>

                {graph.edges.map((e) => {
                    const anchor = anchors.get(e.id);
                    if (!anchor) {
                        return null;
                    }
                    const { a, b } = anchor;
                    const mid = {
                        x: (a.x + b.x) / 2,
                        y:
                            (a.y + b.y) / 2 -
                            (Math.abs(a.y - b.y) < 12 ? 22 : 0),
                    };
                    return (
                        <EdgeLabel
                            edge={e}
                            key={`lbl-${e.id}`}
                            mid={mid}
                            replaying={replaying}
                        />
                    );
                })}

                {graph.nodes.map((n) => {
                    if (n.kind === 'strategy') {
                        return (
                            <StrategyModule
                                key={n.id}
                                node={n}
                                onSelect={onSelect}
                                replaying={replaying}
                                selected={selected === n.id}
                            />
                        );
                    }
                    return (
                        <EndpointCard
                            key={n.id}
                            node={n}
                            onSelect={onSelect}
                            selected={selected === n.id}
                        />
                    );
                })}
            </div>

            <ZoomControls
                onFit={reset}
                onZoomIn={() => zoomCentre(wrapRef, zoomAt, 1.2)}
                onZoomOut={() => zoomCentre(wrapRef, zoomAt, 1 / 1.2)}
                scale={view.k}
            />
        </div>
    );
};

/** Zoom around the container centre — for the +/- buttons. */
const zoomCentre = (
    ref: React.RefObject<HTMLDivElement | null>,
    zoomAt: (factor: number, px: number, py: number) => void,
    factor: number,
): void => {
    const el = ref.current;
    if (!el) {
        return;
    }
    zoomAt(factor, el.clientWidth / 2, el.clientHeight / 2);
};

const ZoomControls: React.FC<{
    scale: number;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onFit: () => void;
}> = ({ scale, onZoomIn, onZoomOut, onFit }) => (
    <div className="absolute right-4 bottom-4 z-30 flex items-center gap-1 rounded-xl border border-neutral-100 bg-neutral-0/90 p-1 shadow-neutral-md backdrop-blur-md">
        <button
            aria-label="Zoom out"
            className="flex size-8 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100"
            onClick={onZoomOut}
            type="button"
        >
            <MmIcon name="minus" size={16} />
        </button>
        <button
            className="min-w-[44px] rounded-lg px-1 py-1 text-center font-semibold text-neutral-600 text-xs tabular-nums hover:bg-neutral-100"
            onClick={onFit}
            title="Fit to screen"
            type="button"
        >
            {Math.round(scale * 100)}%
        </button>
        <button
            aria-label="Zoom in"
            className="flex size-8 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100"
            onClick={onZoomIn}
            type="button"
        >
            <MmIcon name="plus" size={16} />
        </button>
    </div>
);
