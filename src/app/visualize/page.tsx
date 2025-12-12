'use client';

import {
    Background,
    Controls,
    Edge,
    MiniMap,
    Node,
    Position,
    ReactFlow,
    ReactFlowProvider,
    useEdgesState,
    useNodesState,
    useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';

// Graph Layout Helper using Dagre
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 60; // Increased height for better visibility
const graphSpacing = {
    ranksep: 140,
    nodesep: 140,
};

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({
        rankdir: direction,
        ranksep: graphSpacing.ranksep,
        nodesep: graphSpacing.nodesep,
    });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const newNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        return {
            ...node,
            targetPosition: isHorizontal ? Position.Left : Position.Top,
            sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
            // We are shifting the dagre node position (anchor=center center) to the top left
            // so it matches the React Flow node anchor point (top left).
            position: {
                x: nodeWithPosition.x - nodeWidth / 2,
                y: nodeWithPosition.y - nodeHeight / 2,
            },
        };
    });

    return { nodes: newNodes, edges };
};

const buildTooltip = (node: any): string | null => {
    const meta = node?.metadata;
    if (!meta) return null;

    const lines: string[] = [];

    if (meta.kind === 'policy') {
        if (meta.name) lines.push(`Policy: ${meta.name}`);
        if (meta.policyKey) lines.push(`Key: ${meta.policyKey}`);
        if (meta.interfaceType) lines.push(`Interface: ${meta.interfaceType}`);
        if (meta.strategy?.type) lines.push(`Strategy: ${meta.strategy.type}`);

        const model = meta.strategy?.model;
        if (model?.type === 'ratio') {
            const recipients = Array.isArray(model.recipients) ? model.recipients.join(', ') : undefined;
            const ratios = Array.isArray(model.ratios) ? model.ratios.join(' / ') : undefined;
            if (recipients) lines.push(`Recipients: ${recipients}`);
            if (ratios) lines.push(`Ratios: ${ratios}`);
        }

        if (meta.strategy?.source?.token?.symbol) {
            lines.push(`Token: ${meta.strategy.source.token.symbol}`);
        }
        if (meta.sourceInfo?.label) {
            lines.push(`Source: ${meta.sourceInfo.label}`);
        } else if (meta.strategy?.source?.address) {
            lines.push(`Source: ${meta.strategy.source.address}`);
        }
        if (meta.vaultInfo?.label) {
            lines.push(`Vault: ${meta.vaultInfo.label}`);
        } else if (meta.strategy?.source?.vaultAddress) {
            lines.push(`Vault: ${meta.strategy.source.vaultAddress}`);
        }
        if (meta.description) {
            lines.push(`Description: ${meta.description}`);
        }
    } else if (meta.kind === 'plugin') {
        if (meta.name) lines.push(`Plugin: ${meta.name}`);
        if (meta.slug) lines.push(`Slug: ${meta.slug}`);
        if (meta.subdomain) lines.push(`Subdomain: ${meta.subdomain}`);
    }

    return lines.length ? lines.join('\n') : null;
};

function VisualizeFlow() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const txHash = searchParams.get('tx');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Explicitly type the state for React Flow 12+ / xyflow
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const [inputTx, setInputTx] = useState('');

    const { fitView } = useReactFlow();

    const fetchGraph = useCallback(
        async (hash: string) => {
            if (!hash) return;
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/visualize?tx=${hash}`);
                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.error || 'Failed to fetch trace');
                }
                const data = await res.json();

                const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
                    data.nodes.map((n: any) => {
                        const background =
                            n.type === 'DAO'
                                ? '#eef'
                                : n.type === 'SUBDAO'
                                  ? '#f4f0ff'
                                  : n.type === 'PLUGIN'
                                    ? '#e8f7ff'
                                    : n.type === 'ROUTER'
                                      ? '#fff8e1'
                                      : '#fff';

                        const tooltip = buildTooltip(n);

                        return {
                            ...n,
                            position: { x: 0, y: 0 },
                            data: {
                                label: <div title={tooltip || undefined}>{n.label}</div>,
                                type: n.type,
                            },
                            style: {
                                border: '1px solid #777',
                                padding: 10,
                                borderRadius: 5,
                                background,
                                width: nodeWidth,
                            },
                        };
                    }),
                    data.edges.map((e: any) => ({
                        ...e,
                        style: { stroke: e.type === 'TOKEN' ? '#10b981' : '#b1b1b7' },
                        animated: e.type === 'TOKEN',
                        labelStyle: { fill: '#888', fontWeight: 700 },
                    })),
                );

                setNodes(layoutedNodes);
                setEdges(layoutedEdges);

                // Short delay to allow render before fitting
                setTimeout(() => window.requestAnimationFrame(() => fitView()), 100);
            } catch (err: any) {
                setError(err.message);
                console.error(err);
            } finally {
                setLoading(false);
            }
        },
        [setNodes, setEdges, fitView],
    );

    useEffect(() => {
        if (txHash) {
            setInputTx(txHash);
            fetchGraph(txHash);
        }
    }, [txHash, fetchGraph]);

    const handleVisualize = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputTx) {
            router.push(`/visualize?tx=${inputTx}`);
        }
    };

    return (
        <div className="flex h-screen w-full flex-col bg-neutral-50">
            {/* Header / Input */}
            <div className="z-10 flex flex-col items-center gap-4 border-b border-neutral-200 bg-white p-4 shadow-sm md:flex-row">
                <h1 className="text-xl font-bold text-neutral-800">Tx Visualizer</h1>
                <form onSubmit={handleVisualize} className="flex max-w-2xl flex-1 gap-2">
                    <input
                        className="flex-1 rounded border border-neutral-300 px-3 py-2 text-sm"
                        placeholder="Enter Transaction Hash (0x...)"
                        value={inputTx}
                        onChange={(e) => setInputTx(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? 'Loading...' : 'Visualize'}
                    </button>
                </form>
            </div>

            {/* Content */}
            <div className="relative flex-1">
                {error && (
                    <div className="absolute top-4 left-1/2 z-50 -translate-x-1/2 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
                        <p>
                            <strong>Error:</strong> {error}
                        </p>
                    </div>
                )}

                {!txHash && !loading && nodes.length === 0 && (
                    <div className="flex h-full items-center justify-center text-neutral-400">
                        <p>Enter a transaction hash to see the flow.</p>
                    </div>
                )}

                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    fitView
                    attributionPosition="bottom-left"
                >
                    <Background />
                    <Controls />
                    <MiniMap style={{ height: 120 }} zoomable pannable />
                </ReactFlow>
            </div>
        </div>
    );
}

export default function VisualizePage() {
    return (
        <ReactFlowProvider>
            <VisualizeFlow />
        </ReactFlowProvider>
    );
}
