import type { Edge, Node } from '@xyflow/react';
import type { IPermissionEdgeEntry } from './permissionGraphEdge';
import { PERMISSION_GRAPH_HANDLE } from './permissionGraphNodeTypes';

export const PERMISSION_GRAPH_MIN_ZOOM = 0.2;

const READABLE_FIT_MIN_ZOOM = 0.45;
const SELF_STACK_GAP = 48;
const FALLBACK_NODE_WIDTH = 256;
const FALLBACK_NODE_HEIGHT = 92;
const FALLBACK_STACK_WIDTH = 160;
const STACK_ROW_HEIGHT = 20;
const STACK_CONDITION_ROW_HEIGHT = 34;
const STACK_ROW_GAP = 2;

const getStackPermissions = (node: Node): IPermissionEdgeEntry[] =>
    Array.isArray(node.data?.permissions)
        ? (node.data.permissions as IPermissionEdgeEntry[])
        : [];

const getFallbackNodeSize = (node: Node) => {
    if (node.type !== 'permissionStack') {
        return { width: FALLBACK_NODE_WIDTH, height: FALLBACK_NODE_HEIGHT };
    }

    const permissions = getStackPermissions(node);
    const rowHeight = permissions.reduce(
        (height, permission) =>
            height +
            (permission.conditionLabel == null
                ? STACK_ROW_HEIGHT
                : STACK_CONDITION_ROW_HEIGHT),
        0,
    );
    const rowGap = Math.max(permissions.length - 1, 0) * STACK_ROW_GAP;

    return {
        width: FALLBACK_STACK_WIDTH,
        height: Math.max(rowHeight + rowGap, STACK_ROW_HEIGHT),
    };
};

const getNodeRect = (node: Node) => {
    const fallback = getFallbackNodeSize(node);

    return {
        x: node.position.x,
        y: node.position.y,
        width: node.measured?.width ?? fallback.width,
        height: node.measured?.height ?? fallback.height,
    };
};

const getNodeCenter = (node: Node): { x: number; y: number } => {
    const rect = getNodeRect(node);

    return {
        x: rect.x + rect.width / 2,
        y: rect.y + rect.height / 2,
    };
};

const getFacingHandles = (
    sourceNode: Node,
    targetNode: Node,
): {
    sourceHandle: string;
    targetHandle: string;
} => {
    const sourceCenter = getNodeCenter(sourceNode);
    const targetCenter = getNodeCenter(targetNode);
    const targetIsBelowOrLevel = targetCenter.y >= sourceCenter.y;

    return targetIsBelowOrLevel
        ? {
              sourceHandle: PERMISSION_GRAPH_HANDLE.sourceBottom,
              targetHandle: PERMISSION_GRAPH_HANDLE.targetTop,
          }
        : {
              sourceHandle: PERMISSION_GRAPH_HANDLE.sourceTop,
              targetHandle: PERMISSION_GRAPH_HANDLE.targetBottom,
          };
};

type PermissionGraphHandleSide = 'top' | 'right' | 'bottom' | 'left';

const SOURCE_HANDLE_BY_SIDE: Record<PermissionGraphHandleSide, string> = {
    top: PERMISSION_GRAPH_HANDLE.sourceTop,
    right: PERMISSION_GRAPH_HANDLE.sourceRight,
    bottom: PERMISSION_GRAPH_HANDLE.sourceBottom,
    left: PERMISSION_GRAPH_HANDLE.sourceLeft,
};

const TARGET_HANDLE_BY_SIDE: Record<PermissionGraphHandleSide, string> = {
    top: PERMISSION_GRAPH_HANDLE.targetTop,
    right: PERMISSION_GRAPH_HANDLE.targetRight,
    bottom: PERMISSION_GRAPH_HANDLE.targetBottom,
    left: PERMISSION_GRAPH_HANDLE.targetLeft,
};

const HANDLE_SIDE_BY_ID: Record<string, PermissionGraphHandleSide> = {
    [PERMISSION_GRAPH_HANDLE.sourceTop]: 'top',
    [PERMISSION_GRAPH_HANDLE.sourceRight]: 'right',
    [PERMISSION_GRAPH_HANDLE.sourceBottom]: 'bottom',
    [PERMISSION_GRAPH_HANDLE.sourceLeft]: 'left',
    [PERMISSION_GRAPH_HANDLE.targetTop]: 'top',
    [PERMISSION_GRAPH_HANDLE.targetRight]: 'right',
    [PERMISSION_GRAPH_HANDLE.targetBottom]: 'bottom',
    [PERMISSION_GRAPH_HANDLE.targetLeft]: 'left',
};

const OPPOSITE_HANDLE_SIDE: Record<
    PermissionGraphHandleSide,
    PermissionGraphHandleSide
> = {
    top: 'bottom',
    right: 'left',
    bottom: 'top',
    left: 'right',
};

const getHandleSide = (
    handleId: string | null | undefined,
): PermissionGraphHandleSide | undefined =>
    handleId == null ? undefined : HANDLE_SIDE_BY_ID[handleId];

const enforceOppositeStackSides = (edges: Edge[]): Edge[] => {
    const nextEdges = [...edges];
    const edgesByStackId = new Map<
        string,
        {
            origin?: { edge: Edge; index: number };
            target?: { edge: Edge; index: number };
        }
    >();

    for (const [index, edge] of edges.entries()) {
        const stackId = edge.data?.permissionStackId;
        const stackConnection = edge.data?.stackConnection;

        if (
            typeof stackId !== 'string' ||
            (stackConnection !== 'origin' && stackConnection !== 'target')
        ) {
            continue;
        }

        const group = edgesByStackId.get(stackId) ?? {};
        group[stackConnection] = { edge, index };
        edgesByStackId.set(stackId, group);
    }

    for (const group of edgesByStackId.values()) {
        if (
            group.origin == null ||
            group.target == null ||
            group.origin.edge.data?.lockHandles === true ||
            group.target.edge.data?.lockHandles === true
        ) {
            continue;
        }

        const targetStackSide = getHandleSide(group.target.edge.sourceHandle);
        const originStackSide = getHandleSide(group.origin.edge.targetHandle);

        if (
            targetStackSide == null ||
            originStackSide == null ||
            targetStackSide !== originStackSide
        ) {
            continue;
        }

        const nextOriginStackSide = OPPOSITE_HANDLE_SIDE[targetStackSide];
        nextEdges[group.origin.index] = {
            ...group.origin.edge,
            targetHandle: TARGET_HANDLE_BY_SIDE[nextOriginStackSide],
        };
    }

    return nextEdges;
};

const getOppositeVerticalSourceSide = (
    sourceSide: PermissionGraphHandleSide,
): PermissionGraphHandleSide => (sourceSide === 'top' ? 'bottom' : 'top');

const enforceNodeMarkerHandleSeparation = (edges: Edge[]): Edge[] => {
    const arrowEndSidesByNode = new Map<
        string,
        Set<PermissionGraphHandleSide>
    >();

    for (const edge of edges) {
        if (edge.markerEnd == null) {
            continue;
        }

        const targetSide = getHandleSide(edge.targetHandle);

        if (targetSide == null) {
            continue;
        }

        const nodeSides = arrowEndSidesByNode.get(edge.target) ?? new Set();
        nodeSides.add(targetSide);
        arrowEndSidesByNode.set(edge.target, nodeSides);
    }

    return edges.map((edge) => {
        if (edge.markerStart == null) {
            return edge;
        }

        const sourceSide = getHandleSide(edge.sourceHandle);
        const arrowEndSides = arrowEndSidesByNode.get(edge.source);

        if (
            sourceSide == null ||
            arrowEndSides == null ||
            !arrowEndSides.has(sourceSide)
        ) {
            return edge;
        }

        const nextSourceSide = getOppositeVerticalSourceSide(sourceSide);
        return {
            ...edge,
            sourceHandle: SOURCE_HANDLE_BY_SIDE[nextSourceSide],
        };
    });
};

export const alignEdgesWithNodePositions = (
    nodes: Node[],
    edges: Edge[],
): Edge[] => {
    const nodeById = new Map(nodes.map((node) => [node.id, node]));

    const alignedEdges = edges.map((edge) => {
        if (edge.data?.lockHandles === true) {
            return edge;
        }

        const sourceNode = nodeById.get(edge.source);
        const targetNode = nodeById.get(edge.target);

        if (sourceNode == null || targetNode == null) {
            return edge;
        }

        return {
            ...edge,
            ...getFacingHandles(sourceNode, targetNode),
        };
    });

    return enforceNodeMarkerHandleSeparation(
        enforceOppositeStackSides(alignedEdges),
    );
};

export const getGraphBounds = (nodes: Node[]) => {
    const rects = nodes.map(getNodeRect);

    const minX = Math.min(...rects.map((rect) => rect.x));
    const minY = Math.min(...rects.map((rect) => rect.y));
    const maxX = Math.max(...rects.map((rect) => rect.x + rect.width));
    const maxY = Math.max(...rects.map((rect) => rect.y + rect.height));

    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
    };
};

interface IFitViewRect {
    width: number;
    height: number;
}

export const getFitViewMinZoom = (
    bounds: IFitViewRect,
    container: IFitViewRect,
): number => {
    const widthFitZoom = container.width / bounds.width;
    const heightFitZoom = container.height / bounds.height;
    const requiredFitZoom = Math.min(widthFitZoom, heightFitZoom);

    return requiredFitZoom < READABLE_FIT_MIN_ZOOM
        ? PERMISSION_GRAPH_MIN_ZOOM
        : READABLE_FIT_MIN_ZOOM;
};

export const getLayoutSignature = (nodes: Node[], edges: Edge[]): string =>
    [
        nodes
            .map(
                (node) =>
                    `${node.id}:${node.measured?.width ?? 0}x${node.measured?.height ?? 0}`,
            )
            .join('|'),
        edges.map((edge) => `${edge.source}->${edge.target}`).join('|'),
    ].join('::');

export const positionSelfStacks = (nodes: Node[]): Node[] => {
    const nodeById = new Map(nodes.map((node) => [node.id, node]));

    return nodes.map((node) => {
        if (node.type !== 'permissionStack') {
            return node;
        }

        const stackRect = getNodeRect(node);
        const selfTargetId = node.data?.selfTargetId;

        if (typeof selfTargetId === 'string') {
            const targetNode = nodeById.get(selfTargetId);

            if (targetNode == null) {
                return node;
            }

            const targetRect = getNodeRect(targetNode);
            return {
                ...node,
                position: {
                    x:
                        targetNode.position.x +
                        targetRect.width / 2 -
                        stackRect.width / 2,
                    y:
                        targetNode.position.y -
                        stackRect.height -
                        SELF_STACK_GAP,
                },
            };
        }

        return node;
    });
};
