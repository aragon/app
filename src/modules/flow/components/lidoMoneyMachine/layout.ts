// Vendored from dao-launchpad@f/lido-demo:lido/preview/ui/src — do not edit by hand.
// See infra/lmm-demo/README.md → "Updating vendored libs" for the refresh procedure.
// Adapted: imports rewritten to use the in-tree @/shared/lidoPreview vendoring
// of @aragon/lido-preview, with .ts/.tsx extensions stripped for moduleResolution=bundler.
//
// Local extension: `rankdir` argument so the same dagre helper handles both
// the structural wiring view (TB) and the money-flow view (LR).  See
// `TopologyView` for the toggle that selects between the two.

import dagre from '@dagrejs/dagre';
import type { ReactFlowGraph } from '@/shared/lidoPreview';

const NODE_WIDTH = 200;
const NODE_HEIGHT = 72;

export interface ILayoutOptions {
    /** TB = top-to-bottom (wiring), LR = left-to-right (money flow). */
    rankdir?: 'TB' | 'LR';
    nodesep?: number;
    ranksep?: number;
}

/**
 * dagre layout. React Flow's default node handles are at top/bottom edges
 * for TB and left/right for LR, so the same node component works in both
 * orientations without custom handles.
 *
 * React Flow positions by top-left; dagre by node center — we subtract
 * half the size to align.
 */
export function layout(
    graph: ReactFlowGraph,
    options: ILayoutOptions = {},
): ReactFlowGraph {
    const { rankdir = 'TB', nodesep = 40, ranksep = 100 } = options;
    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    // `tight-tree` ranker keeps strategies in array-index order on the
    // same rank.  Default `network-simplex` minimizes crossings via
    // barycenter sweeps, which is free to mirror the strategy row
    // (Wrap → UniV2 → CowSwap arrived as CowSwap → UniV2 → Wrap on some
    // layouts).  `tight-tree` is deterministic for tree-shaped inputs.
    g.setGraph({ rankdir, nodesep, ranksep, ranker: 'tight-tree' });

    for (const node of graph.nodes) {
        g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
    }
    for (const edge of graph.edges) {
        g.setEdge(edge.source, edge.target);
    }

    dagre.layout(g);

    // ---- In-rank ordering post-pass ---------------------------------------
    //
    // `ranker: 'tight-tree'` only fixes rank *assignment*; dagre's order
    // phase still uses barycenter to minimise crossings, which is free to
    // mirror a sibling row.  In the wiring view the user expects strategies
    // ordered left→right by on-chain index (`[0]`, `[1]`, `[2]`), which
    // `toReactFlowGraph` emits as `composes`-edge labels.
    //
    // We rebuild the cross-axis coordinate per rank by sorting nodes that
    // carry a `[N]` order index, preserving the rank's existing extent so
    // the layout doesn't visually jump.
    const horizontal = rankdir === 'LR';
    const orderByTarget = new Map<string, number>();
    for (const e of graph.edges) {
        if (e.type !== 'composes' && !(e.label && /^\[\d+\]$/.test(e.label))) {
            continue;
        }
        const m = (e.label ?? '').match(/^\[(\d+)\]$/);
        if (m) {
            orderByTarget.set(e.target, Number(m[1]));
        }
    }

    if (orderByTarget.size > 0) {
        const buckets = new Map<
            number,
            Array<{ id: string; cross: number; order: number }>
        >();
        for (const n of graph.nodes) {
            const order = orderByTarget.get(n.id);
            if (order == null) {
                continue;
            }
            const pos = g.node(n.id);
            const rank = Math.round(horizontal ? pos.x : pos.y);
            const cross = horizontal ? pos.y : pos.x;
            const list = buckets.get(rank) ?? [];
            list.push({ id: n.id, cross, order });
            buckets.set(rank, list);
        }
        for (const list of buckets.values()) {
            if (list.length < 2) {
                continue;
            }
            const crosses = list
                .map((entry) => entry.cross)
                .sort((a, b) => a - b);
            list.sort((a, b) => a.order - b.order);
            list.forEach((entry, i) => {
                const target = crosses[i];
                if (target == null) {
                    return;
                }
                const dagreNode = g.node(entry.id);
                if (horizontal) {
                    dagreNode.y = target;
                } else {
                    dagreNode.x = target;
                }
            });
        }
    }

    return {
        nodes: graph.nodes.map((n) => {
            const pos = g.node(n.id);
            return {
                ...n,
                position: {
                    x: pos.x - NODE_WIDTH / 2,
                    y: pos.y - NODE_HEIGHT / 2,
                },
            };
        }),
        edges: graph.edges,
    };
}
