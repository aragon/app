import type {
    IPermissionGraph,
    IPermissionGraphEdge,
    IPermissionGraphNode,
} from '../../types';
import { getLayoutedElements } from '../../utils/permissionGraphLayout';
import { positionSelfStacks } from './permissionGraphCanvasLayout';
import {
    buildFlowElements,
    getLayoutDirection,
} from './permissionGraphFlowElements';
import { PERMISSION_GRAPH_HANDLE } from './permissionGraphNodeTypes';

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

describe('getLayoutDirection', () => {
    it.each([
        {
            name: 'places the DAO above plugin actors for incoming-only graphs',
            anchor: anchorId,
            edges: [
                buildEdge('incoming', { source: pluginId, target: anchorId }),
            ],
            expected: 'BT',
        },
        {
            name: 'keeps top-to-bottom layout when DAO-granted rows are visible',
            anchor: anchorId,
            edges: [
                buildEdge('outgoing', { source: anchorId, target: pluginId }),
            ],
            expected: 'TB',
        },
        {
            name: 'keeps active-contract execute views on the stable top-to-bottom layout direction',
            anchor: pluginId,
            edges: [
                buildEdge('execute', {
                    source: pluginId,
                    target: anchorId,
                    permissionName: 'EXECUTE_PERMISSION',
                    permissionDisplayName: 'Execute',
                }),
            ],
            expected: 'TB',
        },
    ])('$name', ({ anchor, edges, expected }) => {
        const result = getLayoutDirection(edges, anchor);

        expect(result).toBe(expected);
    });
});

describe('buildFlowElements', () => {
    it('builds stacks for every graph edge without a graph-local visibility selector', () => {
        const graph = buildGraph([
            buildEdge('granted', { source: pluginId, target: anchorId }),
            buildEdge('from-dao', { source: anchorId, target: externalId }),
            buildEdge('unrelated', { source: otherId, target: externalId }),
        ]);

        const { nodes, edges } = buildFlowElements({
            anchorId,
            graph,
            onSelectEdge: jest.fn(),
        });

        expect(
            nodes.filter((node) => node.type === 'permissionStack'),
        ).toHaveLength(3);
        expect(edges).toHaveLength(6);
    });

    it.each([
        {
            name: 'uses incoming handles when only plugin-to-DAO rows are visible',
            anchor: anchorId,
            edges: [
                buildEdge('incoming', { source: pluginId, target: anchorId }),
            ],
        },
        {
            name: 'keeps plugin-to-DAO edges on incoming handles in mixed graphs',
            anchor: anchorId,
            edges: [
                buildEdge('incoming', { source: pluginId, target: anchorId }),
                buildEdge('outgoing', { source: anchorId, target: pluginId }),
            ],
        },
        {
            name: 'keeps execute permissions on bottom-to-top handles even when the active contract is the who',
            anchor: pluginId,
            edges: [
                buildEdge('execute', {
                    source: pluginId,
                    target: anchorId,
                    permissionName: 'EXECUTE_PERMISSION',
                    permissionDisplayName: 'Execute',
                }),
            ],
        },
    ])('$name', ({ anchor, edges }) => {
        const { edges: flowEdges } = buildFlowElements({
            anchorId: anchor,
            graph: buildGraph(edges),
            onSelectEdge: jest.fn(),
        });
        const incomingStackId = `permission-stack-${pluginId}-${anchorId}`;
        const incomingHandles = {
            sourceHandle: PERMISSION_GRAPH_HANDLE.sourceTop,
            targetHandle: PERMISSION_GRAPH_HANDLE.targetBottom,
        };

        expect(
            flowEdges.find((edge) => edge.id === `${incomingStackId}-origin`),
        ).toMatchObject(incomingHandles);
        expect(
            flowEdges.find((edge) => edge.id === `${incomingStackId}-target`),
        ).toMatchObject(incomingHandles);
    });

    it('connects core DAO self-permission stacks from stack bottom to DAO top', () => {
        const graph = buildGraph(
            [buildEdge('dao-self', { source: anchorId, target: anchorId })],
            [
                {
                    id: anchorId,
                    kind: 'dao',
                    label: 'DAO',
                    address: anchorId,
                },
            ],
        );

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

    it('keeps proposal creator nodes below their governing body target', () => {
        const creatorId = 'governing-body-actor-anyone-core';
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
        });
        const createProposalStackId = `permission-stack-${creatorId}-${pluginId}`;

        expect(
            nodes.find((node) => node.id === createProposalStackId),
        ).toBeDefined();

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
        });
        const executeStackId = `permission-stack-${pluginId}-${anchorId}`;
        const daoGrantedStackId = `permission-stack-${anchorId}-${pluginId}`;

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
