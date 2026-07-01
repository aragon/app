import dagre from '@dagrejs/dagre';
import type { Edge, Node } from '@xyflow/react';

/**
 * Direction the graph flows, mapped to dagre's `rankdir`. The permissions graph
 * uses `BT` so grantees sit below the targets they act on (Figma 21334-247470).
 */
export type PermissionGraphDirection = 'TB' | 'BT' | 'LR' | 'RL';

export interface IGetLayoutedElementsOptions {
    /**
     * Rank direction. Defaults to `BT` (bottom-to-top).
     */
    direction?: PermissionGraphDirection;
    /**
     * Separation between nodes in the same rank.
     */
    nodesep?: number;
    /**
     * Separation between ranks.
     */
    ranksep?: number;
}

/**
 * Fallback node dimensions used when a node has not yet been measured by React
 * Flow. Dagre requires explicit dimensions to lay out the graph.
 */
const DEFAULT_NODE_WIDTH = 280;
const DEFAULT_NODE_HEIGHT = 88;
const DEFAULT_NODE_SEP = 130;
const DEFAULT_RANK_SEP = 220;

const getNodeSize = (node: Node): { width: number; height: number } => ({
    width: node.measured?.width ?? DEFAULT_NODE_WIDTH,
    height: node.measured?.height ?? DEFAULT_NODE_HEIGHT,
});

/**
 * Runs dagre auto-layout over the given nodes/edges and returns a NEW nodes
 * array with computed positions. Dagre reports node centres; React Flow expects
 * the top-left corner, so each position is converted with the same dimensions
 * fed to dagre.
 */
export const getLayoutedElements = (
    nodes: Node[],
    edges: Edge[],
    options: IGetLayoutedElementsOptions = {},
): { nodes: Node[]; edges: Edge[] } => {
    const {
        direction = 'BT',
        nodesep = DEFAULT_NODE_SEP,
        ranksep = DEFAULT_RANK_SEP,
    } = options;

    const graph = new dagre.graphlib.Graph();
    graph.setGraph({ rankdir: direction, nodesep, ranksep });
    graph.setDefaultEdgeLabel(() => ({}));

    for (const node of nodes) {
        graph.setNode(node.id, getNodeSize(node));
    }

    for (const edge of edges) {
        graph.setEdge(edge.source, edge.target);
    }

    dagre.layout(graph);

    const layoutedNodes = nodes.map((node) => {
        const { x, y } = graph.node(node.id);
        const { width, height } = getNodeSize(node);

        return {
            ...node,
            position: { x: x - width / 2, y: y - height / 2 },
        };
    });

    return { nodes: layoutedNodes, edges };
};
