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
    // mirror a sibling row.  In the wiring view the user expects every
    // node to sit under the strategy that uses it, ordered left→right by
    // on-chain index (`composes [0]`, `[1]`, `[2]` — emitted by
    // `toReactFlowGraph` as edge labels).
    //
    // Two-phase fix:
    //   1. Read `[N]` labels off every edge → that pins strategies.
    //   2. Propagate orders downstream along outgoing edges (min over all
    //      ordered ancestors) so budgets/gates/providers inherit their
    //      parent strategy's column.  A node reached by both `[0]` and
    //      `[2]` ends up under `[0]` — intentional: shared infra hugs the
    //      leftmost user.
    // Then we rebuild the cross-axis coordinate per rank by sorting all
    // ordered nodes, preserving the rank's existing extent so the layout
    // doesn't visually jump compared to dagre's default.
    const horizontal = rankdir === 'LR';
    const orderByNode = new Map<string, number>();
    for (const e of graph.edges) {
        const m = (e.label ?? '').match(/^\[(\d+)\]$/);
        if (m) {
            const n = Number(m[1]);
            const cur = orderByNode.get(e.target);
            if (cur == null || n < cur) {
                orderByNode.set(e.target, n);
            }
        }
    }

    // BFS-style propagation: keep relaxing min(order) along edges until no
    // more updates.  Bounded by node count so we can't loop on a pathological
    // cycle (graph is a DAG by construction, but defence in depth is cheap).
    let safety = graph.nodes.length + 1;
    let changed = true;
    while (changed && safety > 0) {
        safety -= 1;
        changed = false;
        for (const e of graph.edges) {
            const src = orderByNode.get(e.source);
            if (src == null) {
                continue;
            }
            const tgt = orderByNode.get(e.target);
            if (tgt == null || src < tgt) {
                orderByNode.set(e.target, src);
                changed = true;
            }
        }
    }

    if (orderByNode.size > 0) {
        const buckets = new Map<
            number,
            Array<{ id: string; cross: number; order: number }>
        >();
        for (const n of graph.nodes) {
            const order = orderByNode.get(n.id);
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
            // Stable order: primary by inherited strategy index, secondary by
            // dagre's original cross-axis position so siblings within the same
            // order bucket (e.g. two budgets for the same leg) keep dagre's
            // crossing-minimising arrangement.
            list.sort((a, b) => a.order - b.order || a.cross - b.cross);
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
