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

    it('uses incoming handles when only plugin-to-DAO rows are visible', () => {
        const incomingEdge = buildEdge('incoming', {
            source: pluginId,
            target: anchorId,
        });
        const { edges } = buildFlowElements({
            anchorId,
            graph: buildGraph([incomingEdge]),
            onSelectEdge: jest.fn(),
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
