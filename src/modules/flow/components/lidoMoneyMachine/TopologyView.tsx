// Vendored from dao-launchpad@f/lido-demo:lido/preview/ui/src — do not edit by hand.
// See infra/lmm-demo/README.md → "Updating vendored libs" for the refresh procedure.
// Adapted: imports rewritten to use the in-tree @/shared/lidoPreview vendoring
// of @aragon/lido-preview, with .ts/.tsx extensions stripped for moduleResolution=bundler.

import {
    Background,
    Controls,
    type Edge,
    MiniMap,
    type Node,
    ReactFlow,
} from '@xyflow/react';
import { useEffect, useMemo, useState } from 'react';
import '@xyflow/react/dist/style.css';
import type { Address } from 'viem';
import {
    type GraphNode,
    type TopologyGraph,
    toReactFlowGraph,
} from '@/shared/lidoPreview';
import { formatAmount, shortAddress } from './format';
import { layout } from './layout';
import { NodeDetails } from './NodeDetails';
import type { StatusSnapshot } from './useStatus';

// --- Live-value helpers (read from `status` and format for a node label) ---

function liveBudgetLineForStrategy(
    status: StatusSnapshot | undefined,
    strategyAddress: Address,
): string | undefined {
    if (!status) {
        return undefined;
    }
    const b = status.budgets.find(
        (e) =>
            e.strategyAddress.toLowerCase() === strategyAddress.toLowerCase(),
    );
    if (!b) {
        return undefined;
    }
    return `${formatAmount(b.amount, b.token.decimals, 4)} ${b.token.symbol ?? ''}`.trim();
}

function liveBudgetLinesForStrategy(
    status: StatusSnapshot | undefined,
    strategyAddress: Address,
): string[] {
    if (!status) {
        return [];
    }
    return status.budgets
        .filter(
            (e) =>
                e.strategyAddress.toLowerCase() ===
                strategyAddress.toLowerCase(),
        )
        .map((b) =>
            `${formatAmount(b.amount, b.token.decimals, 4)} ${b.token.symbol ?? ''}`.trim(),
        );
}

function liveBudgetLineForBudget(
    status: StatusSnapshot | undefined,
    budgetAddress: Address,
    token: unknown,
): string | undefined {
    if (!status) {
        return undefined;
    }
    const b = status.budgets.find(
        (e) => e.budgetAddress.toLowerCase() === budgetAddress.toLowerCase(),
    );
    if (!b) {
        return undefined;
    }
    const decimals = (token as TokenData)?.decimals ?? null;
    return `${formatAmount(b.amount, decimals, 4)}`;
}

/** Single-line "amount token" for budget nodes — falls back to just the
 *  token symbol when status hasn't loaded yet, so the second line of a
 *  budget node always carries useful info. */
function budgetAmountAndToken(
    status: StatusSnapshot | undefined,
    budgetAddress: Address,
    token: unknown,
): string {
    const tok = tokenLabel(token);
    const line = liveBudgetLineForBudget(status, budgetAddress, token);
    return line ? `${line} ${tok}` : tok;
}

/** Per-strategy "would fire" pill, sourced from the simulator's prediction.
 *  Unifies the signals each strategy self-checks (paused state, epoch
 *  lockout, gate, oracle staleness, budget=0, pool-ratio drift) into one
 *  short label so the topology node tells the user at a glance whether
 *  the next dispatch will move tokens here.  When the simulator returns
 *  `no-op`, the predictor's `reason` is appended as a parenthetical so the
 *  reader doesn't have to click into NodeDetails for the common cases. */
function strategyStateLabel(
    status: StatusSnapshot | undefined,
    strategyAddress: Address,
): string | undefined {
    const flow = status?.nextDispatch;
    if (!flow) {
        return undefined;
    }
    const step = flow.steps.find(
        (s) =>
            s.strategyRef.address.toLowerCase() ===
            strategyAddress.toLowerCase(),
    );
    if (!step) {
        return undefined;
    }
    switch (step.status) {
        case 'executed':
            return '● active';
        case 'no-op': {
            const reason = compactReason(step.reason);
            return reason ? `○ closed (${reason})` : '○ closed';
        }
        case 'skipped-paused':
            return '○ paused';
        case 'opaque':
        case 'downstream-opaque':
            return '◇ opaque';
        default:
            return step.status;
    }
}

/** Shorten predictor `reason` strings so they fit on a topology node.
 *  The full reason is always available in NodeDetails. */
function compactReason(reason: string | undefined): string | undefined {
    if (!reason) {
        return undefined;
    }
    if (reason.startsWith('oracle stale')) {
        return 'oracle stale';
    }
    if (reason.startsWith('same epoch')) {
        return 'dispatched';
    }
    if (reason === 'gate closed') {
        return 'gate closed';
    }
    if (reason.startsWith('pool ratio')) {
        return 'pool drift';
    }
    if (reason.includes('budget') && reason.includes('0')) {
        return 'budget 0';
    }
    if (reason.startsWith('UniV2 pair not deployed')) {
        return 'pair missing';
    }
    // Fall back to truncated raw reason.
    return reason.length > 28 ? `${reason.slice(0, 25)}…` : reason;
}

export function TopologyView({
    topology,
    status,
    lidoDaoAddress,
    initialSelectedNodeAddress,
}: {
    topology: TopologyGraph;
    status?: StatusSnapshot;
    /** When provided, prepends a "Lido DAO" parent node above the LMM DAO so
     *  the ownership chain reads top-to-bottom: Lido DAO → LMM DAO → plugin
     *  → strategies.  This is deployment-knowledge from the UI's manifest,
     *  not something the generic inspect step can derive. */
    lidoDaoAddress?: string;
    /** Deep-link target.  Matched case-insensitively against `data.address`
     *  on every node; first match wins and is presented as the open
     *  NodeDetails sidebar.  Used by the dashboard orchestrator chip click
     *  to land the user directly on the strategy they tapped. */
    initialSelectedNodeAddress?: string;
}) {
    const [selected, setSelected] = useState<GraphNode | null>(null);

    const wiring = useMemo(() => {
        const raw = toReactFlowGraph(topology);
        if (lidoDaoAddress) {
            const lidoId = 'lido-dao';
            raw.nodes.push({
                id: lidoId,
                type: 'lido-dao',
                data: { address: lidoDaoAddress },
                position: { x: 0, y: 0 },
            });
            // The LMM DAO node is emitted as `root/dao` for dispatch-plugin
            // topologies (see reactFlow.ts).  If we ever generalise this, look
            // up the DAO node by type instead of by id.
            raw.edges.push({
                id: `${lidoId}->root/dao`,
                source: lidoId,
                target: 'root/dao',
                label: 'owns',
                type: 'owns',
            });
        }
        const laidOut = layout(raw, { rankdir: 'TB' });
        const map = new Map<string, GraphNode>();
        for (const n of laidOut.nodes) {
            map.set(n.id, n);
        }
        return {
            nodes: laidOut.nodes.map((n) => toReactFlowNode(n, status)),
            edges: laidOut.edges.map(toReactFlowEdge),
            byId: map,
        };
    }, [topology, status, lidoDaoAddress]);

    const { nodes, edges, byId } = wiring;

    // Close any open details when the topology changes, then re-apply the
    // deep-link selection if one was requested.  Looked up against
    // `data.address` (the only stable identifier we can derive from a
    // strategy chip URL — node ids are path-based and not user-meaningful).
    // `byId` is a fresh Map per topology re-layout, so depending on it
    // implicitly covers topology changes too.
    useEffect(() => {
        if (initialSelectedNodeAddress == null) {
            setSelected(null);
            return;
        }
        const target = initialSelectedNodeAddress.toLowerCase();
        const match = Array.from(byId.values()).find(
            (n) =>
                typeof n.data.address === 'string' &&
                (n.data.address as string).toLowerCase() === target,
        );
        setSelected(match ?? null);
    }, [initialSelectedNodeAddress, byId]);

    return (
        <div className="topology relative">
            <ReactFlow
                edges={edges}
                fitView
                nodes={nodes}
                nodesConnectable={false}
                onNodeClick={(_event, node) => {
                    const original = byId.get(node.id);
                    if (original) {
                        setSelected(original);
                    }
                }}
                onPaneClick={() => setSelected(null)}
                proOptions={{ hideAttribution: true }}
            >
                <Background gap={20} />
                <Controls position="bottom-right" />
                <MiniMap pannable position="top-right" zoomable />
            </ReactFlow>
            {selected && (
                <NodeDetails
                    node={selected}
                    onClose={() => setSelected(null)}
                    status={status}
                />
            )}
        </div>
    );
}

// --- Conversion from our typed GraphNode to React Flow's Node --------------

function toReactFlowNode(node: GraphNode, status?: StatusSnapshot): Node {
    return {
        id: node.id,
        type: 'default',
        position: node.position,
        data: {
            label: renderLabel(node, status),
        },
        className: cssClass(node.type),
    };
}

function toReactFlowEdge(edge: {
    id: string;
    source: string;
    target: string;
    label?: string;
    type?: string;
}): Edge {
    return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        type: 'default',
        animated: edge.type === 'distributes-to',
        className: edge.type ? `edge-${edge.type}` : undefined,
    };
}

// --- Labels ----------------------------------------------------------------

function renderLabel(node: GraphNode, status?: StatusSnapshot): string {
    const d = node.data;
    switch (node.type) {
        case 'plugin.dispatch':
            // The DAO is now its own parent node, so no need to repeat the
            // address here.  Just title + strategy count.
            return multiline(
                'DispatcherPlugin',
                `${d.strategyCount} ${d.strategyCount === 1 ? 'strategy' : 'strategies'}`,
            );

        case 'plugin.unknown':
            return multiline(
                'Unknown plugin',
                shortAddress(node.id.split('/').pop() ?? ''),
            );

        case 'dao':
            return multiline('LMM DAO', shortAddress(d.address as string));
        case 'lido-dao':
            return multiline('Lido DAO', shortAddress(d.address as string));

        // CR vanilla strategies — kept minimal.
        case 'strategy.dispatch.transfer':
            return multiline('Transfer', d.paused ? 'paused' : undefined);
        case 'strategy.dispatch.burn':
            return multiline('Burn', d.paused ? 'paused' : undefined);
        case 'strategy.dispatch.epoch-transfer':
            return multiline('EpochTransfer', d.paused ? 'paused' : undefined);

        // Lido strategies — show live budget on the node when status is loaded.
        case 'strategy.dispatch.lido.wrap':
            return multiline(
                'Wrap',
                liveBudgetLineForStrategy(status, d.address as Address),
                strategyStateLabel(status, d.address as Address),
                d.paused ? 'paused' : undefined,
            );
        case 'strategy.dispatch.lido.univ2-liquidity':
            return multiline(
                'UniV2 LP',
                ...liveBudgetLinesForStrategy(status, d.address as Address),
                strategyStateLabel(status, d.address as Address),
                d.paused ? 'paused' : undefined,
            );
        case 'strategy.dispatch.lido.gated-cowswap':
            return multiline(
                'Gated CowSwap',
                liveBudgetLineForStrategy(status, d.address as Address),
                strategyStateLabel(status, d.address as Address),
                d.paused ? 'paused' : undefined,
            );
        case 'strategy.unknown':
            return multiline('Unknown strategy', String(d.strategyId ?? '?'));

        case 'budget.full':
            return multiline(
                'FullBudget',
                budgetAmountAndToken(status, d.address as Address, d.token),
            );
        case 'budget.required':
            return multiline(
                'RequiredBudget',
                budgetAmountAndToken(status, d.address as Address, d.token),
            );
        case 'budget.lido.stream-until':
            return multiline(
                'StreamUntil',
                budgetAmountAndToken(status, d.address as Address, d.token),
            );
        case 'budget.unknown':
            return multiline('Unknown budget', tokenLabel(d.token));

        case 'lido.price-floor-gate': {
            const g = status?.gate;
            // Render whatever's available: live state if status loaded, falls
            // back to "PriceFloorGate" alone if not.
            return multiline(
                'PriceFloorGate',
                g?.price !== null && g?.price !== undefined
                    ? `${formatAmount(g.price, 6, 2)} USD`
                    : undefined,
                g ? (g.passes ? 'open' : 'closed') : undefined,
            );
        }

        case 'splitter.solo':
            return multiline('Solo', shortAddress(d.recipient as string));
        case 'splitter.equal': {
            const n = (d.recipients as unknown[] | undefined)?.length ?? 0;
            return multiline('Equal', `${n} recipient${n === 1 ? '' : 's'}`);
        }
        case 'splitter.ratio': {
            const n = (d.entries as unknown[] | undefined)?.length ?? 0;
            return multiline('Ratio', `${n} recipient${n === 1 ? '' : 's'}`);
        }
        case 'splitter.unknown':
            return 'Unknown splitter';

        case 'epoch-provider':
            return multiline('EpochProvider', `epoch ${d.currentEpoch ?? '?'}`);

        case 'recipient':
            return shortAddress((d.address as string) ?? '');

        default:
            return node.type;
    }
}

function cssClass(nodeType: string): string {
    return `rf-node rf-${nodeType.replace(/\./g, '-')}`;
}

type TokenData =
    | { symbol: string | null; decimals: number | null; address: string }
    | undefined;

function tokenLabel(token: unknown): string {
    const t = token as TokenData;
    if (!t) {
        return '?';
    }
    if (t.symbol) {
        return t.symbol;
    }
    return shortAddress(t.address);
}

function multiline(...lines: Array<string | undefined | false>): string {
    return lines.filter((l): l is string => Boolean(l)).join('\n');
}
