import type { Edge, Node } from '@xyflow/react';
import type { IPermissionGraph, IPermissionGraphEdge } from '../../types';
import {
    alignEdgesWithNodePositions,
    getFitViewMinZoom,
    getLayoutSignature,
    positionSelfStacks,
} from './permissionGraphCanvasLayout';
import { buildFlowElements } from './permissionGraphFlowElements';
import { PERMISSION_GRAPH_HANDLE } from './permissionGraphNodeTypes';

if (globalThis.structuredClone == null) {
    Object.defineProperty(globalThis, 'structuredClone', {
        value: <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T,
    });
}

const anchorId = '0x1111111111111111111111111111111111111111';

const buildEdge = (
    id: string,
    partial: Pick<IPermissionGraphEdge, 'source' | 'target'> &
        Partial<
            Pick<
                IPermissionGraphEdge,
                'permissionDisplayName' | 'permissionName'
            >
        >,
): IPermissionGraphEdge => ({
    id,
    permissionDisplayName: 'Permission',
    permissionName: 'PERMISSION',
    row: {
        permissionId: 'permission-id',
        whoAddress: partial.source,
        whereAddress: partial.target,
        conditionAddress: '0x0000000000000000000000000000000000000000',
    },
    ...partial,
});

describe('getLayoutSignature', () => {
    it('changes when React Flow replaces fallback dimensions with measured node sizes', () => {
        const edges: Edge[] = [
            { id: 'edge', source: 'source', target: 'target' },
        ];
        const fallbackNodes = [
            { id: 'source', data: {}, position: { x: 0, y: 0 } },
            { id: 'target', data: {}, position: { x: 0, y: 0 } },
        ] as Node[];
        const measuredNodes = [
            {
                ...fallbackNodes[0],
                measured: { width: 240, height: 92 },
            },
            {
                ...fallbackNodes[1],
                measured: { width: 320, height: 120 },
            },
        ] as Node[];

        expect(getLayoutSignature(fallbackNodes, edges)).not.toBe(
            getLayoutSignature(measuredNodes, edges),
        );
    });
});

describe('getFitViewMinZoom', () => {
    it('uses the readable zoom for compact graphs', () => {
        expect(
            getFitViewMinZoom(
                { width: 800, height: 400 },
                { width: 1200, height: 640 },
            ),
        ).toBe(0.45);
    });

    it('allows full fit zoom for wide supporting graphs', () => {
        expect(
            getFitViewMinZoom(
                { width: 5000, height: 800 },
                { width: 1200, height: 640 },
            ),
        ).toBe(0.2);
    });
});

describe('positionSelfStacks', () => {
    it('places core DAO self-permission stacks above the DAO node', () => {
        const daoY = 100;
        const daoNode = {
            id: anchorId,
            type: 'permission',
            data: { kind: 'dao' },
            measured: { width: 220, height: 92 },
            position: { x: 100, y: daoY },
        } as Node;
        const stackNode = {
            id: 'permission-stack-dao-self',
            type: 'permissionStack',
            data: { selfTargetId: anchorId },
            measured: { width: 180, height: 40 },
            position: { x: 0, y: 0 },
        } as Node;

        const result = positionSelfStacks([daoNode, stackNode]);
        const positionedStack = result.find(
            (node) => node.id === stackNode.id,
        )!;

        expect(positionedStack.position.y).toBeLessThan(daoY);
    });

    it('connects core DAO self-permission stacks from stack bottom to DAO top', () => {
        const graph: IPermissionGraph = {
            nodes: [
                {
                    id: anchorId,
                    kind: 'dao',
                    label: 'DAO',
                    address: anchorId,
                },
            ],
            edges: [
                buildEdge('dao-self', {
                    source: anchorId,
                    target: anchorId,
                }),
            ],
        };

        const result = buildFlowElements({
            graph,
            anchorId,
            onSelectEdge: jest.fn(),
        });

        expect(result.edges[0]).toMatchObject({
            sourceHandle: PERMISSION_GRAPH_HANDLE.sourceBottom,
            targetHandle: PERMISSION_GRAPH_HANDLE.targetTop,
        });
    });
});

describe('alignEdgesWithNodePositions', () => {
    const buildFlowNode = (
        id: string,
        position: Node['position'],
        measured: NonNullable<Node['measured']>,
    ): Node => ({
        id,
        data: {},
        measured,
        position,
    });

    it('keeps horizontal edges on top/bottom handles', () => {
        const edges: Edge[] = [
            {
                id: 'edge',
                source: 'source',
                target: 'target',
            },
        ];
        const nodes = [
            buildFlowNode('source', { x: 0, y: 0 }, { width: 100, height: 80 }),
            buildFlowNode(
                'target',
                { x: 300, y: 0 },
                { width: 100, height: 80 },
            ),
        ];

        const result = alignEdgesWithNodePositions(nodes, edges);

        expect(result[0]).toMatchObject({
            sourceHandle: PERMISSION_GRAPH_HANDLE.sourceBottom,
            targetHandle: PERMISSION_GRAPH_HANDLE.targetTop,
        });
    });

    it('uses vertical handles when the target is below the source', () => {
        const edges: Edge[] = [
            {
                id: 'edge',
                source: 'source',
                target: 'target',
            },
        ];
        const nodes = [
            buildFlowNode('source', { x: 0, y: 0 }, { width: 100, height: 40 }),
            buildFlowNode(
                'target',
                { x: 0, y: 200 },
                { width: 100, height: 80 },
            ),
        ];

        const result = alignEdgesWithNodePositions(nodes, edges);

        expect(result[0]).toMatchObject({
            sourceHandle: PERMISSION_GRAPH_HANDLE.sourceBottom,
            targetHandle: PERMISSION_GRAPH_HANDLE.targetTop,
        });
    });

    it('preserves locked incoming trident handles during post-layout alignment', () => {
        const edges: Edge[] = [
            {
                id: 'incoming',
                source: 'source',
                sourceHandle: PERMISSION_GRAPH_HANDLE.sourceTop,
                target: 'target',
                targetHandle: PERMISSION_GRAPH_HANDLE.targetBottom,
                data: { visualKind: 'incoming', lockHandles: true },
            },
        ];
        const nodes = [
            buildFlowNode('source', { x: 0, y: 0 }, { width: 100, height: 80 }),
            buildFlowNode(
                'target',
                { x: 300, y: 0 },
                { width: 100, height: 80 },
            ),
        ];

        const result = alignEdgesWithNodePositions(nodes, edges);

        expect(result[0]).toMatchObject({
            sourceHandle: PERMISSION_GRAPH_HANDLE.sourceTop,
            targetHandle: PERMISSION_GRAPH_HANDLE.targetBottom,
        });
    });

    it('realigns mixed incoming edges from final node positions', () => {
        const edges: Edge[] = [
            {
                id: 'incoming',
                source: 'source',
                sourceHandle: PERMISSION_GRAPH_HANDLE.sourceTop,
                target: 'target',
                targetHandle: PERMISSION_GRAPH_HANDLE.targetBottom,
                data: { visualKind: 'incoming' },
            },
        ];
        const nodes = [
            buildFlowNode('source', { x: 0, y: 0 }, { width: 100, height: 80 }),
            buildFlowNode(
                'target',
                { x: 0, y: 200 },
                { width: 100, height: 80 },
            ),
        ];

        const result = alignEdgesWithNodePositions(nodes, edges);

        expect(result[0]).toMatchObject({
            sourceHandle: PERMISSION_GRAPH_HANDLE.sourceBottom,
            targetHandle: PERMISSION_GRAPH_HANDLE.targetTop,
        });
    });

    it('keeps origin dots and target arrows on opposite stack sides', () => {
        const edges: Edge[] = [
            {
                id: 'stack-origin',
                source: 'source',
                target: 'stack',
                data: {
                    permissionStackId: 'stack',
                    stackConnection: 'origin',
                    visualKind: 'incoming',
                },
            },
            {
                id: 'stack-target',
                source: 'stack',
                target: 'target',
                data: {
                    permissionStackId: 'stack',
                    stackConnection: 'target',
                    visualKind: 'incoming',
                },
            },
        ];
        const nodes = [
            buildFlowNode('stack', { x: 0, y: 0 }, { width: 100, height: 40 }),
            buildFlowNode(
                'source',
                { x: 0, y: 200 },
                { width: 100, height: 80 },
            ),
            buildFlowNode(
                'target',
                { x: 0, y: 200 },
                { width: 100, height: 80 },
            ),
        ];

        const result = alignEdgesWithNodePositions(nodes, edges);

        expect(result[0]).toMatchObject({
            sourceHandle: PERMISSION_GRAPH_HANDLE.sourceTop,
            targetHandle: PERMISSION_GRAPH_HANDLE.targetTop,
        });
        expect(result[1]).toMatchObject({
            sourceHandle: PERMISSION_GRAPH_HANDLE.sourceBottom,
            targetHandle: PERMISSION_GRAPH_HANDLE.targetTop,
        });
    });

    it('separates dot starts from arrow ends on the same entity handle', () => {
        const edges: Edge[] = [
            {
                id: 'dot-start',
                source: 'entity',
                target: 'dot-target',
                markerStart: 'dot',
            },
            {
                id: 'arrow-end',
                source: 'arrow-source',
                target: 'entity',
                markerEnd: 'arrow',
            },
        ];
        const nodes = [
            buildFlowNode(
                'dot-target',
                { x: 0, y: -200 },
                { width: 100, height: 80 },
            ),
            buildFlowNode(
                'arrow-source',
                { x: 0, y: -200 },
                { width: 100, height: 80 },
            ),
            buildFlowNode('entity', { x: 0, y: 0 }, { width: 100, height: 80 }),
        ];

        const result = alignEdgesWithNodePositions(nodes, edges);

        expect(result[0]).toMatchObject({
            sourceHandle: PERMISSION_GRAPH_HANDLE.sourceBottom,
        });
        expect(result[1]).toMatchObject({
            targetHandle: PERMISSION_GRAPH_HANDLE.targetTop,
        });
    });

    it('separates source dots from locked target arrows on the same contract node', () => {
        const edges: Edge[] = [
            {
                id: 'selected-who-path',
                source: 'contract',
                target: 'permission-stack',
                markerStart: 'dot',
            },
            {
                id: 'locked-where-path',
                source: 'other-stack',
                target: 'contract',
                targetHandle: PERMISSION_GRAPH_HANDLE.targetBottom,
                markerEnd: 'arrow',
                data: { visualKind: 'incoming', lockHandles: true },
            },
        ];
        const nodes = [
            buildFlowNode(
                'permission-stack',
                { x: 0, y: 200 },
                { width: 100, height: 40 },
            ),
            buildFlowNode(
                'other-stack',
                { x: 0, y: 200 },
                { width: 100, height: 40 },
            ),
            buildFlowNode(
                'contract',
                { x: 0, y: 0 },
                { width: 100, height: 80 },
            ),
        ];

        const result = alignEdgesWithNodePositions(nodes, edges);

        expect(result[0]).toMatchObject({
            sourceHandle: PERMISSION_GRAPH_HANDLE.sourceTop,
        });
        expect(result[1]).toMatchObject({
            targetHandle: PERMISSION_GRAPH_HANDLE.targetBottom,
        });
    });
});
