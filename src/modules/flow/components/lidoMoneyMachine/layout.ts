// Vendored from dao-launchpad@f/lido-demo:lido/preview/ui/src — do not edit by hand.
// See infra/lmm-demo/README.md → "Updating vendored libs" for the refresh procedure.
// Adapted: imports rewritten to use the in-tree @/shared/lidoPreview vendoring
// of @aragon/lido-preview, with .ts/.tsx extensions stripped for moduleResolution=bundler.

import dagre from '@dagrejs/dagre';
import type { ReactFlowGraph } from '@/shared/lidoPreview';

const NODE_WIDTH = 200;
const NODE_HEIGHT = 72;

/**
 * Top-to-bottom dagre layout. React Flow's default node handles are at
 * top/bottom edges, so a TB layout lines them up without needing custom
 * node components.
 *
 * React Flow positions by top-left; dagre by node center — we subtract
 * half the size to align.
 */
export function layout(graph: ReactFlowGraph): ReactFlowGraph {
    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: 'TB', nodesep: 40, ranksep: 100 });

    for (const node of graph.nodes) {
        g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
    }
    for (const edge of graph.edges) {
        g.setEdge(edge.source, edge.target);
    }

    dagre.layout(g);

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
