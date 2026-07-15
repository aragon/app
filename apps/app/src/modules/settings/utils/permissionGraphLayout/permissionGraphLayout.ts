import dagre from '@dagrejs/dagre';
import type { Edge, Node } from '@xyflow/react';

export type PermissionGraphDirection = 'TB' | 'BT' | 'LR' | 'RL';

export interface IGetLayoutedElementsOptions {
    direction?: PermissionGraphDirection;
    nodesep?: number;
    ranksep?: number;
}

const DEFAULT_NODE_WIDTH = 220;
const DEFAULT_NODE_HEIGHT = 92;
const DEFAULT_STACK_NODE_WIDTH = 180;
const DEFAULT_STACK_NODE_HEIGHT = 40;
const DEFAULT_NODE_SEP = 140;
const DEFAULT_RANK_SEP = 260;

const getNodeSize = (node: Node): { width: number; height: number } => {
    if (node.type === 'permissionStack') {
        return {
            width: node.measured?.width ?? DEFAULT_STACK_NODE_WIDTH,
            height: node.measured?.height ?? DEFAULT_STACK_NODE_HEIGHT,
        };
    }

    return {
        width: node.measured?.width ?? DEFAULT_NODE_WIDTH,
        height: node.measured?.height ?? DEFAULT_NODE_HEIGHT,
    };
};

export const getLayoutedElements = (
    nodes: Node[],
    edges: Edge[],
    options: IGetLayoutedElementsOptions = {},
): { nodes: Node[]; edges: Edge[] } => {
    const {
        direction = 'LR',
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
        if (edge.data?.excludeFromLayout === true) {
            continue;
        }

        graph.setEdge(edge.source, edge.target);
    }

    dagre.layout(graph);

    return {
        edges,
        nodes: nodes.map((node) => {
            const { x, y } = graph.node(node.id);
            const { width, height } = getNodeSize(node);

            return {
                ...node,
                position: { x: x - width / 2, y: y - height / 2 },
            };
        }),
    };
};
