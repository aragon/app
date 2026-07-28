'use client';

import {
    Background,
    Controls,
    type Edge,
    getViewportForBounds,
    MarkerType,
    type Node,
    Position,
    ReactFlow,
    useEdgesState,
    useNodesInitialized,
    useNodesState,
    useReactFlow,
} from '@xyflow/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
    IPermissionGraph,
    IPermissionGraphEdge,
    IPermissionGraphNode,
} from '../../types';
import {
    getLayoutedElements,
    type PermissionGraphDirection,
} from '../../utils/permissionGraphLayout';
import {
    type IPermissionEdgeData,
    type IPermissionEdgeEntry,
    type PermissionEdgeVisualKind,
    PermissionGraphEdge,
} from './permissionGraphEdge';
import {
    PERMISSION_GRAPH_HANDLE,
    PermissionGraphNode,
    PermissionStackNode,
} from './permissionGraphNode';

const nodeTypes = {
    permission: PermissionGraphNode,
    permissionStack: PermissionStackNode,
};
const edgeTypes = { permission: PermissionGraphEdge };

const MIN_ZOOM = 0.2;
const READABLE_FIT_MIN_ZOOM = 0.45;
const MAX_ZOOM = 2.5;
const FIT_PADDING = 0.08;
const FIT_DURATION = 250;
const UNPOSITIONED = { x: 0, y: 0 };
const SELECTED_EDGE_Z_INDEX = 20;
const EDGE_ORIGIN_MARKER_NEUTRAL = 'permission-origin-dot-neutral';
const EDGE_ORIGIN_MARKER_ACTIVE = 'permission-origin-dot-active';
const SELF_STACK_GAP = 48;
const FALLBACK_NODE_WIDTH = 256;
const FALLBACK_NODE_HEIGHT = 92;
const FALLBACK_STACK_WIDTH = 240;
const STACK_ROW_HEIGHT = 20;
const STACK_CONDITION_ROW_HEIGHT = 34;
const STACK_ROW_GAP = 2;
type PermissionGraphFlow = 'incoming' | 'outgoing';

export const getVisibleEdges = (
    graph: IPermissionGraph,
): IPermissionGraphEdge[] => graph.edges;

export const getGraphFlow = (
    visibleEdges: IPermissionGraphEdge[],
    anchorId: string,
): PermissionGraphFlow => {
    const nonSelfEdges = visibleEdges.filter(
        (edge) => edge.source !== edge.target,
    );
    const hasIncomingEdges = nonSelfEdges.some(
        (edge) => edge.target === anchorId,
    );
    const hasOutgoingEdges = nonSelfEdges.some(
        (edge) => edge.source === anchorId,
    );

    return hasIncomingEdges && !hasOutgoingEdges ? 'incoming' : 'outgoing';
};

export const getLayoutDirection = (
    visibleEdges: IPermissionGraphEdge[],
    anchorId: string,
): PermissionGraphDirection =>
    getGraphFlow(visibleEdges, anchorId) === 'incoming' ? 'BT' : 'TB';

const getLayoutSpacing = (): { nodesep: number; ranksep: number } => ({
    nodesep: 60,
    ranksep: 170,
});

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

const getGraphBounds = (nodes: Node[]) => {
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

export const positionSelfStacks = (nodes: Node[]): Node[] => {
    const nodeById = new Map(nodes.map((node) => [node.id, node]));

    return nodes.map((node) => {
        const selfTargetId = node.data?.selfTargetId;

        if (
            node.type !== 'permissionStack' ||
            typeof selfTargetId !== 'string'
        ) {
            return node;
        }

        const targetNode = nodeById.get(selfTargetId);

        if (targetNode == null) {
            return node;
        }

        const targetRect = getNodeRect(targetNode);
        const stackRect = getNodeRect(node);
        return {
            ...node,
            position: {
                x:
                    targetNode.position.x +
                    targetRect.width / 2 -
                    stackRect.width / 2,
                y: targetNode.position.y - stackRect.height - SELF_STACK_GAP,
            },
        };
    });
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
): PermissionEdgeVisualKind => (source === target ? 'self' : 'other');

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
    visibleEdges: IPermissionGraphEdge[];
    anchorId: string;
    selectedEdgeId?: string;
    selectedNodeId?: string;
    onSelectEdge: (edgeId: string) => void;
}

export const buildFlowElements = ({
    graph,
    visibleEdges,
    anchorId,
    selectedEdgeId,
    selectedNodeId,
    onSelectEdge,
}: IBuildFlowElementsParams): { nodes: Node[]; edges: Edge[] } => {
    const visibleNodeIds = new Set(
        visibleEdges.flatMap((edge) => [edge.source, edge.target]),
    );
    const selectedEdge =
        selectedEdgeId != null
            ? visibleEdges.find((edge) => edge.id === selectedEdgeId)
            : undefined;

    const graphNodeById = new Map(graph.nodes.map((node) => [node.id, node]));

    const graphFlow = getGraphFlow(visibleEdges, anchorId);
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
                    ...handlePositions,
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

    for (const edge of visibleEdges) {
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
    const edgeHandles = getEdgeHandles(graphFlow);

    for (const group of groups.values()) {
        const active = group.entries.some((entry) => entry.selected === true);
        const isConnectedToSelectedNode =
            selectedNodeId != null &&
            (group.source === selectedNodeId ||
                group.target === selectedNodeId);
        const dimmed =
            (selectedEdge != null && !active) ||
            (selectedNodeId != null && !isConnectedToSelectedNode);
        const visualKind = getEdgeVisualKind(group.source, group.target);
        const stackId = `permission-stack-${pairKey(group.source, group.target)}`;
        const isSelfEdge = visualKind === 'self';
        const isCoreDaoSelfEdge =
            isSelfEdge && graphNodeById.get(group.target)?.kind === 'dao';
        const edgeData = {
            visualKind,
            ...(isSelfEdge ? { selfTargetId: group.target } : {}),
        } satisfies IPermissionEdgeData;

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
                ...handlePositions,
                ...(isSelfEdge ? { selfTargetId: group.target } : {}),
                onSelect: onSelectEdge,
            },
        });

        if (isSelfEdge) {
            edges.push({
                id: `${stackId}-self`,
                source: stackId,
                sourceHandle: isCoreDaoSelfEdge
                    ? PERMISSION_GRAPH_HANDLE.sourceTop
                    : PERMISSION_GRAPH_HANDLE.sourceBottom,
                target: group.target,
                targetHandle: isCoreDaoSelfEdge
                    ? PERMISSION_GRAPH_HANDLE.targetBottom
                    : PERMISSION_GRAPH_HANDLE.targetTop,
                type: 'permission',
                animated: active,
                markerEnd: getEdgeMarker(active),
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
            markerStart: getOriginMarker(active),
            style: getEdgeStyle(active),
            zIndex: active ? SELECTED_EDGE_Z_INDEX : undefined,
            data: edgeData,
        });

        edges.push({
            id: `${stackId}-target`,
            source: stackId,
            sourceHandle: edgeHandles.stackSource,
            target: group.target,
            targetHandle: edgeHandles.targetTarget,
            type: 'permission',
            animated: active,
            markerEnd: getEdgeMarker(active),
            style: getEdgeStyle(active),
            zIndex: active ? SELECTED_EDGE_Z_INDEX : undefined,
            data: edgeData,
        });
    }

    return { nodes: [...nodes, ...stackNodes], edges };
};

export interface IPermissionsGraphCanvasProps {
    anchorId: string;
    graph: IPermissionGraph;
    selectedEdgeId?: string;
    selectedNodeId?: string;
    onSelectedEdgeChange: (edgeId?: string) => void;
    onSelectedNodeChange: (nodeId?: string) => void;
}

export const PermissionsGraphCanvas: React.FC<IPermissionsGraphCanvasProps> = ({
    anchorId,
    graph,
    selectedEdgeId,
    selectedNodeId,
    onSelectedEdgeChange,
    onSelectedNodeChange,
}) => {
    const visibleEdges = useMemo(() => getVisibleEdges(graph), [graph]);
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const { getNodes, setViewport } = useReactFlow();
    const nodesInitialized = useNodesInitialized();
    const layoutSignature = useRef('');
    const containerRef = useRef<HTMLDivElement>(null);
    const [layoutVersion, setLayoutVersion] = useState(0);
    const graphBounds = useRef<ReturnType<typeof getGraphBounds> | undefined>(
        undefined,
    );

    const selectEdge = useCallback(
        (edgeId: string) => {
            onSelectedNodeChange(undefined);
            onSelectedEdgeChange(
                selectedEdgeId === edgeId ? undefined : edgeId,
            );
        },
        [onSelectedEdgeChange, onSelectedNodeChange, selectedEdgeId],
    );

    const fitReadableBounds = useCallback(() => {
        const bounds = graphBounds.current;
        const container = containerRef.current;

        if (bounds == null || container == null) {
            return;
        }

        const viewport = getViewportForBounds(
            bounds,
            container.clientWidth,
            container.clientHeight,
            READABLE_FIT_MIN_ZOOM,
            MAX_ZOOM,
            FIT_PADDING,
        );

        void setViewport(viewport, { duration: FIT_DURATION });
    }, [setViewport]);

    useEffect(() => {
        const currentNodes = getNodes();
        const previousPositions = new Map(
            currentNodes.map((node) => [node.id, node.position]),
        );
        const { nodes: nextNodes, edges: nextEdges } = buildFlowElements({
            graph,
            anchorId,
            visibleEdges,
            selectedEdgeId,
            selectedNodeId,
            onSelectEdge: selectEdge,
        });

        setNodes(
            nextNodes.map((node) => ({
                ...node,
                position: previousPositions.get(node.id) ?? node.position,
            })),
        );
        setEdges(nextEdges);
    }, [
        graph,
        anchorId,
        visibleEdges,
        selectedEdgeId,
        selectedNodeId,
        selectEdge,
        getNodes,
        setNodes,
        setEdges,
    ]);

    useEffect(() => {
        if (!nodesInitialized || nodes.length === 0) {
            return;
        }

        const topologySignature = [
            nodes.map((node) => node.id).join('|'),
            edges.map((edge) => `${edge.source}->${edge.target}`).join('|'),
        ].join('::');

        if (layoutSignature.current === topologySignature) {
            return;
        }

        const currentNodes = getNodes();
        const { nodes: rawLayoutedNodes } = getLayoutedElements(
            currentNodes,
            edges,
            {
                direction: getLayoutDirection(visibleEdges, anchorId),
                ...getLayoutSpacing(),
            },
        );
        const layoutedNodes = positionSelfStacks(rawLayoutedNodes);

        layoutSignature.current = topologySignature;
        graphBounds.current = getGraphBounds(layoutedNodes);
        setNodes(layoutedNodes);
        setEdges(edges);
        setLayoutVersion((version) => version + 1);
    }, [
        anchorId,
        nodesInitialized,
        nodes,
        edges,
        visibleEdges,
        getNodes,
        setNodes,
        setEdges,
    ]);

    useEffect(() => {
        if (layoutVersion === 0 || graphBounds.current == null) {
            return;
        }

        const frame = requestAnimationFrame(() => {
            fitReadableBounds();
        });

        return () => cancelAnimationFrame(frame);
    }, [fitReadableBounds, layoutVersion]);

    return (
        <div className="size-full" ref={containerRef}>
            <ReactFlow
                edges={edges}
                edgesFocusable={false}
                edgeTypes={edgeTypes}
                elementsSelectable={false}
                maxZoom={MAX_ZOOM}
                minZoom={MIN_ZOOM}
                nodes={nodes}
                nodesConnectable={false}
                nodesDraggable={false}
                nodesFocusable={false}
                nodeTypes={nodeTypes}
                onEdgesChange={onEdgesChange}
                onNodeClick={(_event, node) => {
                    if (node.type !== 'permission') {
                        return;
                    }

                    onSelectedEdgeChange(undefined);
                    onSelectedNodeChange(
                        selectedNodeId === node.id ? undefined : node.id,
                    );
                }}
                onNodesChange={onNodesChange}
                onPaneClick={() => {
                    onSelectedEdgeChange(undefined);
                    onSelectedNodeChange(undefined);
                }}
                proOptions={{ hideAttribution: true }}
            >
                <svg
                    aria-hidden="true"
                    className="pointer-events-none absolute size-0"
                >
                    <defs>
                        <marker
                            id={EDGE_ORIGIN_MARKER_NEUTRAL}
                            markerHeight="8"
                            markerUnits="userSpaceOnUse"
                            markerWidth="8"
                            refX="4"
                            refY="4"
                            viewBox="0 0 8 8"
                        >
                            <circle
                                cx="4"
                                cy="4"
                                fill="var(--color-neutral-300)"
                                r="3.5"
                            />
                        </marker>
                        <marker
                            id={EDGE_ORIGIN_MARKER_ACTIVE}
                            markerHeight="8"
                            markerUnits="userSpaceOnUse"
                            markerWidth="8"
                            refX="4"
                            refY="4"
                            viewBox="0 0 8 8"
                        >
                            <circle
                                cx="4"
                                cy="4"
                                fill="var(--color-primary-400)"
                                r="3.5"
                            />
                        </marker>
                    </defs>
                </svg>
                <Background />
                <Controls
                    onFitView={fitReadableBounds}
                    showInteractive={false}
                />
            </ReactFlow>
        </div>
    );
};
