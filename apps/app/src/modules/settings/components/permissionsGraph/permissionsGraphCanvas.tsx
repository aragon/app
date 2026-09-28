'use client';

import type { Edge, Node } from '@xyflow/react';
import {
    Background,
    Controls,
    getViewportForBounds,
    ReactFlow,
    useEdgesState,
    useNodesInitialized,
    useNodesState,
    useReactFlow,
} from '@xyflow/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { IPermissionGraph } from '../../types';
import {
    alignEdgesWithNodePositions,
    getFitViewMinZoom,
    getGraphBounds,
    getLayoutSignature,
    PERMISSION_GRAPH_MIN_ZOOM,
    positionSelfStacks,
} from './permissionGraphCanvasLayoutUtils';
import { PermissionGraphEdge } from './permissionGraphEdge';
import {
    buildFlowElements,
    EDGE_ORIGIN_MARKER_ACTIVE,
    EDGE_ORIGIN_MARKER_NEUTRAL,
    getLayoutDirection,
} from './permissionGraphFlowElementsUtils';
import { getLayoutedElements } from './permissionGraphLayoutUtils';
import { PermissionGraphNode } from './permissionGraphNode';
import { PermissionStackNode } from './permissionStackNode';

const nodeTypes = {
    permission: PermissionGraphNode,
    permissionStack: PermissionStackNode,
};
const edgeTypes = { permission: PermissionGraphEdge };

const MAX_ZOOM = 2.5;
const FIT_PADDING = 0.08;
const FIT_DURATION = 250;

const getLayoutSpacing = (): { nodesep: number; ranksep: number } => ({
    nodesep: 96,
    ranksep: 220,
});

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
            getFitViewMinZoom(bounds, {
                width: container.clientWidth,
                height: container.clientHeight,
            }),
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

        const currentNodes = getNodes();
        const topologySignature = getLayoutSignature(currentNodes, edges);

        if (layoutSignature.current === topologySignature) {
            return;
        }
        const { nodes: rawLayoutedNodes } = getLayoutedElements(
            currentNodes,
            edges,
            {
                direction: getLayoutDirection(graph.edges, anchorId),
                ...getLayoutSpacing(),
            },
        );
        const layoutedNodes = positionSelfStacks(rawLayoutedNodes);
        const alignedEdges = alignEdgesWithNodePositions(layoutedNodes, edges);

        layoutSignature.current = topologySignature;
        graphBounds.current = getGraphBounds(layoutedNodes);
        setNodes(layoutedNodes);
        setEdges(alignedEdges);
        setLayoutVersion((version) => version + 1);
    }, [
        anchorId,
        nodesInitialized,
        nodes,
        edges,
        graph.edges,
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
                minZoom={PERMISSION_GRAPH_MIN_ZOOM}
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
