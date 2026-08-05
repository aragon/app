import type { Edge, Node } from '@xyflow/react';
import { MarkerType, Position } from '@xyflow/react';
import { permissionTransactionUtils } from '@/shared/utils/permissionTransactionUtils';
import type {
    IPermissionGraph,
    IPermissionGraphEdge,
    IPermissionGraphNode,
} from '../../types';
import type {
    IPermissionEdgeData,
    IPermissionEdgeEntry,
    PermissionEdgeVisualKind,
} from './permissionGraphEdge';
import type { PermissionGraphDirection } from './permissionGraphLayoutUtils';
import { PERMISSION_GRAPH_HANDLE } from './permissionGraphNodeTypes';

export const EDGE_ORIGIN_MARKER_NEUTRAL = 'permission-origin-dot-neutral';
export const EDGE_ORIGIN_MARKER_ACTIVE = 'permission-origin-dot-active';

const UNPOSITIONED = { x: 0, y: 0 };
const SELECTED_EDGE_Z_INDEX = 20;

type PermissionGraphFlow = 'incoming' | 'outgoing';

export const getGraphFlow = (
    edges: IPermissionGraphEdge[],
    anchorId: string,
): PermissionGraphFlow => {
    const nonSelfEdges = edges.filter((edge) => edge.source !== edge.target);
    const hasIncomingEdges = nonSelfEdges.some(
        (edge) => edge.target === anchorId,
    );

    return hasIncomingEdges ? 'incoming' : 'outgoing';
};

export const getLayoutDirection = (
    edges: IPermissionGraphEdge[],
    anchorId: string,
): PermissionGraphDirection =>
    getGraphFlow(edges, anchorId) === 'incoming' ? 'BT' : 'TB';

const getHandlePositions = (
    flow: PermissionGraphFlow,
): {
    sourcePosition: Position;
    targetPosition: Position;
} => {
    if (flow === 'incoming') {
        return {
            sourcePosition: Position.Top,
            targetPosition: Position.Bottom,
        };
    }

    return {
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
    };
};

const getEdgeHandles = (flow: PermissionGraphFlow) => {
    if (flow === 'incoming') {
        return {
            originSource: PERMISSION_GRAPH_HANDLE.sourceTop,
            stackTarget: PERMISSION_GRAPH_HANDLE.targetBottom,
            stackSource: PERMISSION_GRAPH_HANDLE.sourceTop,
            targetTarget: PERMISSION_GRAPH_HANDLE.targetBottom,
        };
    }

    return {
        originSource: PERMISSION_GRAPH_HANDLE.sourceBottom,
        stackTarget: PERMISSION_GRAPH_HANDLE.targetTop,
        stackSource: PERMISSION_GRAPH_HANDLE.sourceBottom,
        targetTarget: PERMISSION_GRAPH_HANDLE.targetTop,
    };
};

const getEdgeFlow = (
    visualKind: PermissionEdgeVisualKind,
    defaultFlow: PermissionGraphFlow,
    usesBottomToTopHierarchy: boolean,
): PermissionGraphFlow => {
    if (usesBottomToTopHierarchy) {
        return 'incoming';
    }

    return visualKind === 'incoming' || visualKind === 'outgoing'
        ? visualKind
        : defaultFlow;
};

const edgeBaseStyle = {
    stroke: 'var(--color-neutral-300)',
    strokeWidth: 1.4,
};

const edgeActiveStyle = {
    stroke: 'var(--color-primary-400)',
    strokeWidth: 2,
};

const getEdgeVisualKind = (
    source: string,
    target: string,
    anchorId: string,
): PermissionEdgeVisualKind => {
    if (source === target) {
        return 'self';
    }

    if (target === anchorId) {
        return 'incoming';
    }

    if (source === anchorId) {
        return 'outgoing';
    }

    return 'other';
};

const getOriginMarker = (active: boolean) =>
    active ? EDGE_ORIGIN_MARKER_ACTIVE : EDGE_ORIGIN_MARKER_NEUTRAL;

const getEdgeMarker = (active: boolean) => ({
    type: MarkerType.ArrowClosed,
    color: active ? 'var(--color-primary-400)' : 'var(--color-neutral-300)',
    width: 18,
    height: 18,
});

const getEdgeStyle = (active: boolean) =>
    active ? edgeActiveStyle : edgeBaseStyle;

interface IBuildFlowElementsParams {
    graph: IPermissionGraph;
    anchorId: string;
    selectedEdgeId?: string;
    selectedNodeId?: string;
    onSelectEdge: (edgeId: string) => void;
}

export const buildFlowElements = ({
    graph,
    anchorId,
    selectedEdgeId,
    selectedNodeId,
    onSelectEdge,
}: IBuildFlowElementsParams): { nodes: Node[]; edges: Edge[] } => {
    const visibleNodeIds = new Set(
        graph.edges.flatMap((edge) => [edge.source, edge.target]),
    );
    const selectedEdge =
        selectedEdgeId != null
            ? graph.edges.find((edge) => edge.id === selectedEdgeId)
            : undefined;

    const graphFlow = getGraphFlow(graph.edges, anchorId);
    const handlePositions = getHandlePositions(graphFlow);
    const nodes: Node[] = graph.nodes
        .filter((node) => visibleNodeIds.has(node.id))
        .map((node: IPermissionGraphNode) => {
            const selectionRole =
                selectedEdge?.source === node.id
                    ? 'who'
                    : selectedEdge?.target === node.id
                      ? 'where'
                      : undefined;
            const isSelectedNode = selectedNodeId === node.id;

            return {
                draggable: false,
                id: node.id,
                type: 'permission',
                position: UNPOSITIONED,
                data: {
                    ...node,
                    selectionRole,
                    active: isSelectedNode,
                    dimmed:
                        (selectedEdge != null && selectionRole == null) ||
                        (selectedNodeId != null && !isSelectedNode),
                },
            };
        });

    const pairKey = (source: string, target: string) => `${source}-${target}`;
    const groups = new Map<
        string,
        { source: string; target: string; entries: IPermissionEdgeEntry[] }
    >();

    for (const edge of graph.edges) {
        const key = pairKey(edge.source, edge.target);
        const group = groups.get(key) ?? {
            source: edge.source,
            target: edge.target,
            entries: [],
        };

        group.entries.push({
            edgeId: edge.id,
            permissionDisplayName: edge.permissionDisplayName,
            permissionName: edge.permissionName,
            conditionLabel: edge.conditionLabel,
            selected: selectedEdgeId === edge.id,
        });
        groups.set(key, group);
    }

    const stackNodes: Node[] = [];
    const edges: Edge[] = [];
    const daoNodeIds = new Set(
        graph.nodes
            .filter((node) => node.kind === 'dao')
            .map((node) => node.id),
    );

    for (const group of groups.values()) {
        const active = group.entries.some((entry) => entry.selected === true);
        const isConnectedToSelectedNode =
            selectedNodeId != null &&
            (group.source === selectedNodeId ||
                group.target === selectedNodeId);
        const dimmed =
            (selectedEdge != null && !active) ||
            (selectedNodeId != null && !isConnectedToSelectedNode);
        const visualKind = getEdgeVisualKind(
            group.source,
            group.target,
            anchorId,
        );
        const stackId = `permission-stack-${pairKey(group.source, group.target)}`;
        const isSelfEdge = visualKind === 'self';
        const usesBottomToTopHierarchy = group.entries.some(
            (entry) =>
                entry.permissionName ===
                permissionTransactionUtils.permissionIds.executePermission,
        );
        const edgeHandles = getEdgeHandles(
            getEdgeFlow(visualKind, graphFlow, usesBottomToTopHierarchy),
        );
        const edgeData = {
            visualKind,
            ...(visualKind === 'incoming' && graphFlow === 'incoming'
                ? { lockHandles: true }
                : {}),
            ...(isSelfEdge ? { selfTargetId: group.target } : {}),
        } satisfies IPermissionEdgeData;
        const sourceIsDao = daoNodeIds.has(group.source);
        const targetIsDao = daoNodeIds.has(group.target);
        const usesDaoHierarchy = sourceIsDao !== targetIsDao;
        const daoLayoutNode = sourceIsDao ? group.source : group.target;
        const contractLayoutNode = sourceIsDao ? group.target : group.source;
        const layoutStartsAtDao = graphFlow === 'outgoing';
        const layoutSourceNode = layoutStartsAtDao
            ? daoLayoutNode
            : contractLayoutNode;
        const layoutTargetNode = layoutStartsAtDao
            ? contractLayoutNode
            : daoLayoutNode;
        const originLayoutData = usesDaoHierarchy
            ? { layoutSource: layoutSourceNode, layoutTarget: stackId }
            : {};
        const targetLayoutData = usesDaoHierarchy
            ? { layoutSource: stackId, layoutTarget: layoutTargetNode }
            : {};
        stackNodes.push({
            id: stackId,
            type: 'permissionStack',
            position: UNPOSITIONED,
            draggable: false,
            sourcePosition: handlePositions.sourcePosition,
            targetPosition: handlePositions.targetPosition,
            data: {
                permissions: group.entries,
                active,
                dimmed,
                ...(isSelfEdge ? { selfTargetId: group.target } : {}),
                onSelect: onSelectEdge,
            },
        });

        if (isSelfEdge) {
            edges.push({
                id: `${stackId}-self`,
                source: stackId,
                sourceHandle: PERMISSION_GRAPH_HANDLE.sourceBottom,
                target: group.target,
                targetHandle: PERMISSION_GRAPH_HANDLE.targetTop,
                type: 'permission',
                animated: active,
                markerEnd: active ? getEdgeMarker(true) : undefined,
                style: getEdgeStyle(active),
                zIndex: active ? SELECTED_EDGE_Z_INDEX : undefined,
                data: {
                    ...edgeData,
                    excludeFromLayout: true,
                },
            });

            continue;
        }

        edges.push({
            id: `${stackId}-origin`,
            source: group.source,
            sourceHandle: edgeHandles.originSource,
            target: stackId,
            targetHandle: edgeHandles.stackTarget,
            type: 'permission',
            animated: active,
            markerStart: active ? getOriginMarker(true) : undefined,
            style: getEdgeStyle(active),
            zIndex: active ? SELECTED_EDGE_Z_INDEX : undefined,
            data: {
                ...edgeData,
                permissionStackId: stackId,
                stackConnection: 'origin',
                ...originLayoutData,
            },
        });

        edges.push({
            id: `${stackId}-target`,
            source: stackId,
            sourceHandle: edgeHandles.stackSource,
            target: group.target,
            targetHandle: edgeHandles.targetTarget,
            type: 'permission',
            animated: active,
            markerEnd: active ? getEdgeMarker(true) : undefined,
            style: getEdgeStyle(active),
            zIndex: active ? SELECTED_EDGE_Z_INDEX : undefined,
            data: {
                ...edgeData,
                permissionStackId: stackId,
                stackConnection: 'target',
                ...targetLayoutData,
            },
        });
    }

    return { nodes: [...nodes, ...stackNodes], edges };
};
