import type { Edge, Node } from '@xyflow/react';
import type {
    IPermissionGraph,
    IPermissionGraphEdge,
    IPermissionGraphNode,
} from '../../types';
import { getLayoutedElements } from '../../utils/permissionGraphLayout';
import { PERMISSION_GRAPH_HANDLE } from './permissionGraphNode';
import {
    alignEdgesWithNodePositions,
    buildFlowElements,
    getFitViewMinZoom,
    getLayoutDirection,
    getLayoutSignature,
    getVisibleEdges,
    positionSelfStacks,
} from './permissionsGraphCanvas';

if (globalThis.structuredClone == null) {
    Object.defineProperty(globalThis, 'structuredClone', {
        value: <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T,
    });
}

const anchorId = '0x1111111111111111111111111111111111111111';
const pluginId = '0x2222222222222222222222222222222222222222';
const externalId = '0x3333333333333333333333333333333333333333';
const otherId = '0x4444444444444444444444444444444444444444';

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

const buildGraph = (
    edges: IPermissionGraphEdge[],
    nodes: IPermissionGraphNode[] = [],
): IPermissionGraph => ({
    nodes,
    edges,
});

describe('getVisibleEdges', () => {
    it('keeps granted, from-DAO, and unrelated permissions in one graph', () => {
        const grantedEdge = buildEdge('granted', {
            source: pluginId,
            target: anchorId,
        });
        const oldFromDaoEdge = buildEdge('old-from-dao', {
            source: anchorId,
            target: externalId,
        });
        const unrelatedEdge = buildEdge('unrelated', {
            source: otherId,
            target: externalId,
        });

        const result = getVisibleEdges(
            buildGraph([grantedEdge, oldFromDaoEdge, unrelatedEdge]),
        );

        expect(result).toEqual([grantedEdge, oldFromDaoEdge, unrelatedEdge]);
    });
});

describe('getLayoutDirection', () => {
    it('places the DAO above plugin actors for incoming-only graphs', () => {
        const result = getLayoutDirection(
            [buildEdge('incoming', { source: pluginId, target: anchorId })],
            anchorId,
        );

        expect(result).toBe('BT');
    });

    it('keeps top-to-bottom layout when DAO-granted rows are visible', () => {
        const result = getLayoutDirection(
            [buildEdge('outgoing', { source: anchorId, target: pluginId })],
            anchorId,
        );

        expect(result).toBe('TB');
    });

    it('keeps active-contract execute views on the stable top-to-bottom layout direction', () => {
        const result = getLayoutDirection(
            [
                buildEdge('execute', {
                    source: pluginId,
                    target: anchorId,
                    permissionName: 'EXECUTE_PERMISSION',
                    permissionDisplayName: 'Execute',
                }),
            ],
            pluginId,
        );

        expect(result).toBe('TB');
    });
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

describe('buildFlowElements', () => {
    it('uses incoming handles when only plugin-to-DAO rows are visible', () => {
        const incomingEdge = buildEdge('incoming', {
            source: pluginId,
            target: anchorId,
        });
        const { edges } = buildFlowElements({
            anchorId,
            graph: buildGraph([incomingEdge]),
            onSelectEdge: jest.fn(),
            visibleEdges: [incomingEdge],
        });

        const originEdge = edges.find((edge) => edge.id.endsWith('-origin'));
        const targetEdge = edges.find((edge) => edge.id.endsWith('-target'));

        expect(originEdge).toMatchObject({
            sourceHandle: PERMISSION_GRAPH_HANDLE.sourceTop,
            targetHandle: PERMISSION_GRAPH_HANDLE.targetBottom,
        });
        expect(targetEdge).toMatchObject({
            sourceHandle: PERMISSION_GRAPH_HANDLE.sourceTop,
            targetHandle: PERMISSION_GRAPH_HANDLE.targetBottom,
        });
    });

    it('keeps plugin-to-DAO edges on incoming handles in mixed graphs', () => {
        const incomingEdge = buildEdge('incoming', {
            source: pluginId,
            target: anchorId,
        });
        const outgoingEdge = buildEdge('outgoing', {
            source: anchorId,
            target: pluginId,
        });
        const { edges } = buildFlowElements({
            anchorId,
            graph: buildGraph([incomingEdge, outgoingEdge]),
            onSelectEdge: jest.fn(),
            visibleEdges: [incomingEdge, outgoingEdge],
        });

        const incomingOriginEdge = edges.find(
            (edge) =>
                edge.id === `permission-stack-${pluginId}-${anchorId}-origin`,
        );
        const incomingTargetEdge = edges.find(
            (edge) =>
                edge.id === `permission-stack-${pluginId}-${anchorId}-target`,
        );

        expect(incomingOriginEdge).toMatchObject({
            sourceHandle: PERMISSION_GRAPH_HANDLE.sourceTop,
            targetHandle: PERMISSION_GRAPH_HANDLE.targetBottom,
        });
        expect(incomingTargetEdge).toMatchObject({
            sourceHandle: PERMISSION_GRAPH_HANDLE.sourceTop,
            targetHandle: PERMISSION_GRAPH_HANDLE.targetBottom,
        });
    });

    it('keeps execute permissions on bottom-to-top handles even when the active contract is the who', () => {
        const executeEdge = buildEdge('execute', {
            source: pluginId,
            target: anchorId,
            permissionName: 'EXECUTE_PERMISSION',
            permissionDisplayName: 'Execute',
        });
        const { edges } = buildFlowElements({
            anchorId: pluginId,
            graph: buildGraph([executeEdge]),
            onSelectEdge: jest.fn(),
            visibleEdges: [executeEdge],
        });

        const originEdge = edges.find((edge) => edge.id.endsWith('-origin'));
        const targetEdge = edges.find((edge) => edge.id.endsWith('-target'));

        expect(originEdge).toMatchObject({
            sourceHandle: PERMISSION_GRAPH_HANDLE.sourceTop,
            targetHandle: PERMISSION_GRAPH_HANDLE.targetBottom,
        });
        expect(targetEdge).toMatchObject({
            sourceHandle: PERMISSION_GRAPH_HANDLE.sourceTop,
            targetHandle: PERMISSION_GRAPH_HANDLE.targetBottom,
        });
    });

    it('keeps proposal creator nodes below their governing body target', () => {
        const creatorId = 'proposal-creator-anyone-core';
        const executeEdge = buildEdge('execute', {
            source: pluginId,
            target: anchorId,
            permissionName: 'EXECUTE_PERMISSION',
            permissionDisplayName: 'Execute',
        });
        const createProposalEdge = buildEdge('create-proposal', {
            source: creatorId,
            target: pluginId,
            permissionName: 'CREATE_PROPOSAL_PERMISSION',
            permissionDisplayName: 'Create proposal',
        });
        const graph = buildGraph(
            [executeEdge, createProposalEdge],
            [
                {
                    id: anchorId,
                    kind: 'dao',
                    label: 'DAO',
                    address: anchorId,
                },
                {
                    id: pluginId,
                    kind: 'plugin',
                    label: 'Core Governance',
                    address: pluginId,
                },
                {
                    id: creatorId,
                    kind: 'actor',
                    label: 'Anyone',
                    address: externalId,
                },
            ],
        );
        const { nodes, edges } = buildFlowElements({
            anchorId,
            graph,
            onSelectEdge: jest.fn(),
            visibleEdges: graph.edges,
        });
        const createProposalStackId = `permission-stack-${creatorId}-${pluginId}`;

        expect(
            nodes.find((node) => node.id === createProposalStackId)?.data,
        ).toMatchObject({
            sourceId: creatorId,
            targetId: pluginId,
        });

        const { nodes: layoutedNodes } = getLayoutedElements(nodes, edges, {
            direction: getLayoutDirection(graph.edges, anchorId),
        });
        const positionedNodes = positionSelfStacks(layoutedNodes);
        const nodeById = new Map(
            positionedNodes.map((node) => [node.id, node]),
        );

        expect(nodeById.get(pluginId)!.position.y).toBeLessThan(
            nodeById.get(createProposalStackId)!.position.y,
        );
        expect(nodeById.get(createProposalStackId)!.position.y).toBeLessThan(
            nodeById.get(creatorId)!.position.y,
        );
    });

    it('keeps the DAO above contracts when execute and DAO-granted permissions are both visible', () => {
        const executeEdge = buildEdge('execute', {
            source: pluginId,
            target: anchorId,
            permissionName: 'EXECUTE_PERMISSION',
            permissionDisplayName: 'Execute',
        });
        const daoGrantedEdge = buildEdge('dao-granted', {
            source: anchorId,
            target: pluginId,
            permissionName: 'SET_METADATA_PERMISSION',
            permissionDisplayName: 'Set metadata',
        });
        const graph = buildGraph(
            [executeEdge, daoGrantedEdge],
            [
                {
                    id: anchorId,
                    kind: 'dao',
                    label: 'DAO',
                    address: anchorId,
                },
                {
                    id: pluginId,
                    kind: 'plugin',
                    label: 'Contract',
                    address: pluginId,
                },
            ],
        );
        const { nodes, edges } = buildFlowElements({
            anchorId,
            graph,
            onSelectEdge: jest.fn(),
            visibleEdges: graph.edges,
        });
        const executeStackId = `permission-stack-${pluginId}-${anchorId}`;
        const daoGrantedStackId = `permission-stack-${anchorId}-${pluginId}`;

        expect(
            edges.find((edge) => edge.id === `${executeStackId}-origin`)?.data,
        ).toMatchObject({
            layoutSource: pluginId,
            layoutTarget: executeStackId,
        });
        expect(
            edges.find((edge) => edge.id === `${executeStackId}-target`)?.data,
        ).toMatchObject({
            layoutSource: executeStackId,
            layoutTarget: anchorId,
        });
        expect(
            edges.find((edge) => edge.id === `${daoGrantedStackId}-origin`)
                ?.data,
        ).toMatchObject({
            layoutSource: pluginId,
            layoutTarget: daoGrantedStackId,
        });
        expect(
            edges.find((edge) => edge.id === `${daoGrantedStackId}-target`)
                ?.data,
        ).toMatchObject({
            layoutSource: daoGrantedStackId,
            layoutTarget: anchorId,
        });

        const { nodes: layoutedNodes } = getLayoutedElements(nodes, edges, {
            direction: getLayoutDirection(graph.edges, anchorId),
        });
        const positionedNodes = positionSelfStacks(layoutedNodes);
        const nodeById = new Map(
            positionedNodes.map((node) => [node.id, node]),
        );

        expect(nodeById.get(anchorId)!.position.y).toBeLessThan(
            nodeById.get(executeStackId)!.position.y,
        );
        expect(nodeById.get(executeStackId)!.position.y).toBeLessThan(
            nodeById.get(pluginId)!.position.y,
        );
    });

    it('shows origin dots and target arrows only on the selected permission', () => {
        const edge = buildEdge('perm', {
            source: pluginId,
            target: anchorId,
        });
        const params = {
            anchorId,
            graph: buildGraph([edge]),
            onSelectEdge: jest.fn(),
            visibleEdges: [edge],
        };

        const unselected = buildFlowElements(params);
        expect(
            unselected.edges.find((item) => item.id.endsWith('-origin'))
                ?.markerStart,
        ).toBeUndefined();
        expect(
            unselected.edges.find((item) => item.id.endsWith('-target'))
                ?.markerEnd,
        ).toBeUndefined();

        const selected = buildFlowElements({
            ...params,
            selectedEdgeId: 'perm',
        });
        expect(
            selected.edges.find((item) => item.id.endsWith('-origin'))
                ?.markerStart,
        ).toBeDefined();
        expect(
            selected.edges.find((item) => item.id.endsWith('-target'))
                ?.markerEnd,
        ).toBeDefined();
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
            visibleEdges: graph.edges,
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
