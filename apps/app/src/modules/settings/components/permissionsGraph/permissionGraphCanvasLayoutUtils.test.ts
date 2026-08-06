import type { Edge, Node } from '@xyflow/react';
import {
    alignEdgesWithNodePositions,
    getFitViewMinZoom,
    getLayoutSignature,
    positionSelfStacks,
} from './permissionGraphCanvasLayoutUtils';
import { PERMISSION_GRAPH_HANDLE } from './permissionGraphNodeTypes';

const anchorId = '0x1111111111111111111111111111111111111111';

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
    const container = { width: 1200, height: 640 };

    it.each([
        {
            name: 'uses the readable zoom for compact graphs',
            bounds: { width: 800, height: 400 },
            expected: 0.45,
        },
        {
            name: 'allows full fit zoom for wide supporting graphs',
            bounds: { width: 5000, height: 800 },
            expected: 0.2,
        },
    ])('$name', ({ bounds, expected }) => {
        expect(getFitViewMinZoom(bounds, container)).toBe(expected);
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

    it.each([
        {
            name: 'the target sits level with the source',
            sourceSize: { width: 100, height: 80 },
            targetPosition: { x: 300, y: 0 },
        },
        {
            name: 'the target is below the source',
            sourceSize: { width: 100, height: 40 },
            targetPosition: { x: 0, y: 200 },
        },
    ])('uses vertical handles when $name', ({ sourceSize, targetPosition }) => {
        const edges: Edge[] = [
            {
                id: 'edge',
                source: 'source',
                target: 'target',
            },
        ];
        const nodes = [
            buildFlowNode('source', { x: 0, y: 0 }, sourceSize),
            buildFlowNode('target', targetPosition, {
                width: 100,
                height: 80,
            }),
        ];

        const result = alignEdgesWithNodePositions(nodes, edges);

        expect(result[0]).toMatchObject({
            sourceHandle: PERMISSION_GRAPH_HANDLE.sourceBottom,
            targetHandle: PERMISSION_GRAPH_HANDLE.targetTop,
        });
    });

    it.each([
        {
            name: 'preserves locked incoming trident handles during post-layout alignment',
            data: { visualKind: 'incoming', lockHandles: true },
            targetPosition: { x: 300, y: 0 },
            expected: {
                sourceHandle: PERMISSION_GRAPH_HANDLE.sourceTop,
                targetHandle: PERMISSION_GRAPH_HANDLE.targetBottom,
            },
        },
        {
            name: 'realigns mixed incoming edges from final node positions',
            data: { visualKind: 'incoming' },
            targetPosition: { x: 0, y: 200 },
            expected: {
                sourceHandle: PERMISSION_GRAPH_HANDLE.sourceBottom,
                targetHandle: PERMISSION_GRAPH_HANDLE.targetTop,
            },
        },
    ])('$name', ({ data, targetPosition, expected }) => {
        const edges: Edge[] = [
            {
                id: 'incoming',
                source: 'source',
                sourceHandle: PERMISSION_GRAPH_HANDLE.sourceTop,
                target: 'target',
                targetHandle: PERMISSION_GRAPH_HANDLE.targetBottom,
                data,
            },
        ];
        const nodes = [
            buildFlowNode('source', { x: 0, y: 0 }, { width: 100, height: 80 }),
            buildFlowNode('target', targetPosition, {
                width: 100,
                height: 80,
            }),
        ];

        const result = alignEdgesWithNodePositions(nodes, edges);

        expect(result[0]).toMatchObject(expected);
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
