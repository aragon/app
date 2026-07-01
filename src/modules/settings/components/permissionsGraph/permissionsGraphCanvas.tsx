'use client';

import {
    Background,
    Controls,
    type Edge,
    MarkerType,
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
    type IPermissionEdgeEntry,
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
const UNPOSITIONED = { x: 0, y: 0 };

// Every connector shows control-flow direction in every state: a dot where it
// leaves its source (who) and an arrow where it enters its target (where). The
// selected flow is drawn in primary. React Flow wraps bare dot marker ids as
// url('#<id>') (see the <defs> in the canvas); the arrow uses a built-in marker.
const EDGE_NEUTRAL = {
    style: { stroke: 'var(--color-neutral-300)', strokeWidth: 1.5 },
    markerStart: 'permission-dot-neutral',
    markerEnd: {
        type: MarkerType.ArrowClosed,
        color: 'var(--color-neutral-300)',
        width: 18,
        height: 18,
    },
};
const EDGE_SELECTED_IN = {
    style: { stroke: 'var(--color-primary-400)', strokeWidth: 1.5 },
    markerStart: 'permission-dot-primary',
    markerEnd: 'permission-dot-primary',
};
const EDGE_SELECTED_OUT = {
    style: { stroke: 'var(--color-primary-400)', strokeWidth: 1.5 },
    markerStart: 'permission-dot-primary',
    markerEnd: {
        type: MarkerType.ArrowClosed,
        color: 'var(--color-primary-400)',
        width: 18,
        height: 18,
    },
};

// Vertical gap between the expanded detail card and the who/where nodes it
// connects, so the inline card does not touch either node.
const DETAIL_VERTICAL_GAP = 48;

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

    // Group permissions by the node pair they connect so parallel permissions
    // between the same two nodes share one connector and stack their labels.
    const pairKey = (source: string, target: string) => `${source} ${target}`;
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
            permissionName: edge.permissionName,
            conditionLabel: edge.conditionLabel,
        });
        groups.set(key, group);
    }

    const detailNodes: Node[] = [];
    const flowEdges: Edge[] = [];

    if (selectedEdge == null) {
        for (const group of groups.values()) {
            flowEdges.push({
                id: pairKey(group.source, group.target),
                source: group.source,
                target: group.target,
                type: 'permission',
                ...EDGE_NEUTRAL,
                data: {
                    permissions: group.entries,
                    onSelect: onSelectEdge,
                } satisfies IPermissionEdgeData,
            });
        }
    } else {
        const detailId = `detail-${selectedEdge.id}`;
        const selectedKey = pairKey(selectedEdge.source, selectedEdge.target);

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

        for (const group of groups.values()) {
            const key = pairKey(group.source, group.target);

            if (key !== selectedKey) {
                // Other relationships stay visible but dimmed, labels intact.
                flowEdges.push({
                    id: key,
                    source: group.source,
                    target: group.target,
                    type: 'permission',
                    ...EDGE_NEUTRAL,
                    data: {
                        permissions: group.entries,
                        dimmed: true,
                        onSelect: onSelectEdge,
                    } satisfies IPermissionEdgeData,
                });
                continue;
            }

            // Selected relationship: route through the detail card in primary.
            // Sibling permissions on the same pair ride the who→detail connector,
            // dimmed, so they stay visible without overlapping the card.
            const siblings = group.entries.filter(
                (entry) => entry.edgeId !== selectedEdge.id,
            );
            flowEdges.push(
                siblings.length > 0
                    ? {
                          id: `${selectedEdge.id}-in`,
                          source: selectedEdge.source,
                          target: detailId,
                          type: 'permission',
                          ...EDGE_SELECTED_IN,
                          data: {
                              permissions: siblings,
                              dimmed: true,
                              onSelect: onSelectEdge,
                          } satisfies IPermissionEdgeData,
                      }
                    : {
                          id: `${selectedEdge.id}-in`,
                          source: selectedEdge.source,
                          target: detailId,
                          type: 'smoothstep',
                          ...EDGE_SELECTED_IN,
                      },
            );
            flowEdges.push({
                id: `${selectedEdge.id}-out`,
                source: detailId,
                target: selectedEdge.target,
                type: 'smoothstep',
                ...EDGE_SELECTED_OUT,
            });
        }
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
    const { fitView, getNodes } = useReactFlow();
    const nodesInitialized = useNodesInitialized();

    // Positions the board returns to when the detail card closes. Captured live
    // at the moment of selection, so any manual node drags before opening are
    // the "last known" arrangement we restore to — not the initial auto-layout.
    const restorePositions = useRef(
        new Map<string, { x: number; y: number }>(),
    );
    // Whether a permission is currently expanded, tracked across renders so the
    // effect can tell the open/close transitions apart from steady states.
    const wasSelected = useRef(false);
    // Measured permission-node set the dagre auto-layout last ran for. Auto
    // layout only re-runs when this changes (sizes settling), so it never
    // clobbers manual drags, which leave the signature untouched.
    const autoLayoutSignature = useRef('');

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
        if (!nodesInitialized || layoutSignature === '') {
            return;
        }

        const currentNodes = getNodes();
        const permissionNodes = currentNodes.filter(
            (node) => node.type === 'permission',
        );

        if (permissionNodes.length === 0) {
            return;
        }

        // Signature of just the permission nodes: the auto-layout only depends
        // on these, so the detail card settling to its size never re-flows the
        // board, and manual drags (which don't change sizes) are preserved.
        const permissionSignature = permissionNodes
            .map(
                (node) =>
                    `${node.id}:${Math.round(node.measured?.width ?? 0)}x${Math.round(node.measured?.height ?? 0)}`,
            )
            .join('|');

        // Selection state is read from the node set the sibling effect produced,
        // NOT from `selectedEdgeId`. This keeps the layout a pure function of the
        // committed nodes: it runs one commit after selection changes (when the
        // detail node is already in the store) and can never clobber it.
        const detailNode = currentNodes.find(
            (node) => node.type === 'permissionDetail',
        );
        const whoNode = permissionNodes.find(
            (node) => node.data.selectionRole === 'who',
        );
        const whereNode = permissionNodes.find(
            (node) => node.data.selectionRole === 'where',
        );
        const isSelected =
            detailNode != null && whoNode != null && whereNode != null;

        // Auto-layout: run dagre once per size change while unselected. It never
        // runs during a selection (would fight the frozen board) and never after
        // sizes settle (would clobber drags), so the restore baseline follows
        // the user's own arrangement.
        if (
            !isSelected &&
            autoLayoutSignature.current !== permissionSignature
        ) {
            const baseTopology = graph.edges.map((edge) => ({
                id: edge.id,
                source: edge.source,
                target: edge.target,
            }));
            const { nodes: baseNodes } = getLayoutedElements(
                permissionNodes,
                baseTopology,
                { direction: 'BT' },
            );
            const laid = new Map(
                baseNodes.map((node) => [node.id, node.position]),
            );
            autoLayoutSignature.current = permissionSignature;
            restorePositions.current = laid;
            wasSelected.current = false;
            setNodes(
                currentNodes.map((node) => ({
                    ...node,
                    position: laid.get(node.id) ?? node.position,
                })),
            );
            setLayoutVersion((version) => version + 1);
            return;
        }

        let laidNodes: Node[];

        if (whoNode == null || whereNode == null || detailNode == null) {
            if (!wasSelected.current) {
                // Steady unselected state: leave positions (respect drags).
                return;
            }
            // Card just closed: return every node to its last-known position.
            wasSelected.current = false;
            const restore = restorePositions.current;
            laidNodes = currentNodes.map((node) => ({
                ...node,
                position: restore.get(node.id) ?? node.position,
            }));
        } else {
            // Card is open. On the opening frame, snapshot the live board (dagre
            // layout plus any drags) so closing returns to exactly this.
            if (!wasSelected.current) {
                restorePositions.current = new Map(
                    permissionNodes.map((node) => [node.id, node.position]),
                );
                wasSelected.current = true;
            }
            const frozen = restorePositions.current;
            const whoBase = frozen.get(whoNode.id);
            const whereBase = frozen.get(whereNode.id);

            const whoWidth = whoNode.measured?.width ?? 0;
            const whereWidth = whereNode.measured?.width ?? 0;
            const whereHeight = whereNode.measured?.height ?? 0;
            const detailWidth = detailNode.measured?.width ?? 0;
            const detailHeight = detailNode.measured?.height ?? 0;

            const columnCenterX =
                whoBase != null && whereBase != null
                    ? (whoBase.x +
                          whoWidth / 2 +
                          whereBase.x +
                          whereWidth / 2) /
                      2
                    : (whoBase?.x ?? whereBase?.x ?? 0);

            const detailY =
                (whereBase?.y ?? 0) + whereHeight + DETAIL_VERTICAL_GAP;
            const detailPosition = {
                x: columnCenterX - detailWidth / 2,
                y: detailY,
            };
            const whoPosition = {
                x: whoBase?.x ?? columnCenterX,
                y: detailY + detailHeight + DETAIL_VERTICAL_GAP,
            };

            // Amount the who node slides down to clear the inline card. Every
            // node below the where node shifts by the same delta so the whole
            // lower half opens up rigidly around the card — nodes not in the
            // relationship relocate too, instead of being overlapped.
            const shiftDelta = whoPosition.y - (whoBase?.y ?? 0);
            const whereBaseY = whereBase?.y ?? 0;

            laidNodes = currentNodes.map((node) => {
                if (node.id === detailNode.id) {
                    return { ...node, position: detailPosition };
                }
                if (node.id === whoNode.id) {
                    return { ...node, position: whoPosition };
                }

                const base = frozen.get(node.id);
                if (base == null) {
                    return node;
                }
                // Nodes above/at the where rank stay; everything below slides
                // down to make room for the expanded card.
                const position =
                    base.y > whereBaseY
                        ? { x: base.x, y: base.y + shiftDelta }
                        : base;
                return { ...node, position };
            });
        }

        setNodes(laidNodes);
        setLayoutVersion((version) => version + 1);
    }, [nodesInitialized, layoutSignature, graph, getNodes, setNodes]);

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
            <svg
                aria-hidden="true"
                className="pointer-events-none absolute size-0"
            >
                <defs>
                    <marker
                        id="permission-dot-neutral"
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
                        id="permission-dot-primary"
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
            <Controls showInteractive={false} />
        </ReactFlow>
    );
};
