'use client';

import {
    Background,
    Controls,
    type Edge,
    type Node,
    ReactFlow,
    useEdgesState,
    useNodesInitialized,
    useNodesState,
    useReactFlow,
} from '@xyflow/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { IPermissionGraph } from '../../types';
import { getLayoutedElements } from '../../utils/permissionGraphLayout';
import { PermissionDetailNode } from './permissionDetailNode';
import {
    type IPermissionEdgeData,
    PermissionGraphEdge,
} from './permissionGraphEdge';
import { PermissionGraphNode } from './permissionGraphNode';

const nodeTypes = {
    permission: PermissionGraphNode,
    permissionDetail: PermissionDetailNode,
};
const edgeTypes = { permission: PermissionGraphEdge };

const MIN_ZOOM = 0.2;
const FIT_VIEW_OPTIONS = { padding: 0.2, maxZoom: 1, duration: 300 };
const DIMMED_EDGE_OPACITY = 0.2;
const UNPOSITIONED = { x: 0, y: 0 };

interface IBuildFlowParams {
    graph: IPermissionGraph;
    selectedEdgeId: string | null;
    onSelectEdge: (edgeId: string) => void;
    onClose: () => void;
}

const buildFlowElements = ({
    graph,
    selectedEdgeId,
    onSelectEdge,
    onClose,
}: IBuildFlowParams): { nodes: Node[]; edges: Edge[] } => {
    const selectedEdge =
        selectedEdgeId != null
            ? (graph.edges.find((edge) => edge.id === selectedEdgeId) ?? null)
            : null;

    const nodesById = new Map(graph.nodes.map((node) => [node.id, node]));

    const permissionNodes: Node[] = graph.nodes.map((node) => {
        let selectionRole: 'who' | 'where' | undefined;

        if (selectedEdge?.source === node.id) {
            selectionRole = 'who';
        } else if (selectedEdge?.target === node.id) {
            selectionRole = 'where';
        }

        return {
            id: node.id,
            type: 'permission',
            position: UNPOSITIONED,
            data: {
                ...node,
                selectionRole,
                dimmed: selectedEdge != null && selectionRole == null,
            },
        };
    });

    const detailNodes: Node[] = [];
    let flowEdges: Edge[];

    if (selectedEdge == null) {
        flowEdges = graph.edges.map((edge) => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            type: 'permission',
            data: {
                permissionName: edge.permissionName,
                conditionLabel: edge.conditionLabel,
                onSelect: () => onSelectEdge(edge.id),
            } satisfies IPermissionEdgeData,
        }));
    } else {
        const detailId = `detail-${selectedEdge.id}`;

        detailNodes.push({
            id: detailId,
            type: 'permissionDetail',
            position: UNPOSITIONED,
            draggable: false,
            data: {
                edge: selectedEdge,
                whoLabel: nodesById.get(selectedEdge.source)?.label ?? '',
                whereLabel: nodesById.get(selectedEdge.target)?.label ?? '',
                onClose,
            },
        });

        flowEdges = graph.edges.flatMap((edge) => {
            if (edge.id === selectedEdge.id) {
                return [
                    {
                        id: `${edge.id}-in`,
                        source: edge.source,
                        target: detailId,
                        type: 'smoothstep',
                    },
                    {
                        id: `${edge.id}-out`,
                        source: detailId,
                        target: edge.target,
                        type: 'smoothstep',
                    },
                ];
            }

            // Hide sibling permissions between the same pair so they don't draw
            // duplicate connectors alongside the expanded detail node.
            if (
                edge.source === selectedEdge.source &&
                edge.target === selectedEdge.target
            ) {
                return [];
            }

            // Other edges become plain dimmed lines without labels.
            return [
                {
                    id: edge.id,
                    source: edge.source,
                    target: edge.target,
                    type: 'smoothstep',
                    style: { opacity: DIMMED_EDGE_OPACITY },
                },
            ];
        });
    }

    return { nodes: [...permissionNodes, ...detailNodes], edges: flowEdges };
};

export interface IPermissionsGraphCanvasProps {
    /**
     * Resolved permission graph to render.
     */
    graph: IPermissionGraph;
}

export const PermissionsGraphCanvas: React.FC<IPermissionsGraphCanvasProps> = ({
    graph,
}) => {
    const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const { fitView, getNodes, getEdges } = useReactFlow();
    const nodesInitialized = useNodesInitialized();
    const layoutKey = useRef('');

    const selectEdge = useCallback((edgeId: string) => {
        setSelectedEdgeId((current) => (current === edgeId ? null : edgeId));
    }, []);
    const clearSelection = useCallback(() => setSelectedEdgeId(null), []);

    // Rebuild the node/edge set when the graph or selection changes, preserving
    // known positions so surviving nodes do not jump before re-layout.
    useEffect(() => {
        const previousPositions = new Map(
            getNodes().map((node) => [node.id, node.position]),
        );

        const { nodes: nextNodes, edges: nextEdges } = buildFlowElements({
            graph,
            selectedEdgeId,
            onSelectEdge: selectEdge,
            onClose: clearSelection,
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
        selectedEdgeId,
        selectEdge,
        clearSelection,
        getNodes,
        setNodes,
        setEdges,
    ]);

    // Once React Flow has measured the current node set, lay it out with the
    // real measured dimensions. The signature includes each node's measured size
    // so the layout re-runs when a node settles to its final size.
    const layoutSignature = nodes
        .map(
            (node) =>
                `${node.id}:${Math.round(node.measured?.width ?? 0)}x${Math.round(node.measured?.height ?? 0)}`,
        )
        .join('|');
    const [layoutVersion, setLayoutVersion] = useState(0);

    useEffect(() => {
        if (
            !nodesInitialized ||
            layoutSignature === '' ||
            layoutKey.current === layoutSignature
        ) {
            return;
        }

        const { nodes: laidNodes } = getLayoutedElements(
            getNodes(),
            getEdges(),
            { direction: 'BT' },
        );
        layoutKey.current = layoutSignature;
        setNodes(laidNodes);
        setLayoutVersion((version) => version + 1);
    }, [nodesInitialized, layoutSignature, getNodes, getEdges, setNodes]);

    // Fit the view after the laid-out positions have committed.
    useEffect(() => {
        if (layoutVersion === 0) {
            return;
        }

        const frame = requestAnimationFrame(() => {
            void fitView(FIT_VIEW_OPTIONS);
        });

        return () => cancelAnimationFrame(frame);
    }, [layoutVersion, fitView]);

    return (
        <ReactFlow
            edges={edges}
            edgeTypes={edgeTypes}
            fitViewOptions={FIT_VIEW_OPTIONS}
            minZoom={MIN_ZOOM}
            nodes={nodes}
            nodesConnectable={false}
            nodeTypes={nodeTypes}
            onEdgesChange={onEdgesChange}
            onNodesChange={onNodesChange}
            onPaneClick={clearSelection}
            proOptions={{ hideAttribution: true }}
        >
            <Background />
            <Controls showInteractive={false} />
        </ReactFlow>
    );
};
