import type { Node } from '@xyflow/react';
import type { IPermissionGraph, IPermissionGraphEdge } from '../../types';
import { PERMISSION_GRAPH_HANDLE } from './permissionGraphNode';
import {
    buildFlowElements,
    getLayoutDirection,
    getVisibleEdges,
    positionSelfStacks,
} from './permissionsGraphCanvas';

const anchorId = '0x1111111111111111111111111111111111111111';
const pluginId = '0x2222222222222222222222222222222222222222';
const externalId = '0x3333333333333333333333333333333333333333';
const otherId = '0x4444444444444444444444444444444444444444';

const buildEdge = (
    id: string,
    partial: Pick<IPermissionGraphEdge, 'source' | 'target'>,
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

const buildGraph = (edges: IPermissionGraphEdge[]): IPermissionGraph => ({
    nodes: [],
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

    it('connects core DAO self-permission stacks to the DAO bottom handle', () => {
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
            sourceHandle: PERMISSION_GRAPH_HANDLE.sourceTop,
            targetHandle: PERMISSION_GRAPH_HANDLE.targetBottom,
        });
    });
});
