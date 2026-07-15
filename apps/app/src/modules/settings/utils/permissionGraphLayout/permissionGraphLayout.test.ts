import type { Edge, Node } from '@xyflow/react';
import { getLayoutedElements } from './permissionGraphLayout';

if (globalThis.structuredClone == null) {
    Object.defineProperty(globalThis, 'structuredClone', {
        value: <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T,
    });
}

const buildNode = (id: string, partial?: Partial<Node>): Node => ({
    id,
    data: {},
    position: { x: 0, y: 0 },
    ...partial,
});

describe('getLayoutedElements', () => {
    it('converts dagre center coordinates to React Flow top-left coordinates', () => {
        const measuredNode = buildNode('dao', {
            measured: { width: 240, height: 96 },
        });

        const { nodes } = getLayoutedElements([measuredNode], []);

        expect(nodes[0]).toMatchObject({ position: { x: 0, y: 0 } });
        expect(nodes[0]).not.toBe(measuredNode);
    });

    it('uses permission stack dimensions when placing stack nodes between endpoints', () => {
        const nodes = [
            buildNode('who', { measured: { width: 240, height: 96 } }),
            buildNode('stack', {
                type: 'permissionStack',
                measured: { width: 120, height: 32 },
            }),
            buildNode('where', { measured: { width: 240, height: 96 } }),
        ];
        const edges: Edge[] = [
            { id: 'who-stack', source: 'who', target: 'stack' },
            { id: 'stack-where', source: 'stack', target: 'where' },
        ];

        const { nodes: layoutedNodes } = getLayoutedElements(nodes, edges, {
            direction: 'LR',
            ranksep: 100,
        });
        const nodeById = new Map(layoutedNodes.map((node) => [node.id, node]));
        const who = nodeById.get('who')!;
        const stack = nodeById.get('stack')!;
        const where = nodeById.get('where')!;
        const whoCenterX = who.position.x + 120;
        const stackCenterX = stack.position.x + 60;
        const whereCenterX = where.position.x + 120;

        expect(whoCenterX).toBeLessThan(stackCenterX);
        expect(stackCenterX).toBeLessThan(whereCenterX);
    });

    it('skips edges marked as excluded from layout', () => {
        const nodes = [
            buildNode('dao', { measured: { width: 240, height: 96 } }),
            buildNode('self-stack', {
                type: 'permissionStack',
                measured: { width: 120, height: 32 },
            }),
        ];
        const excludedEdge = {
            id: 'self-stack-dao',
            source: 'self-stack',
            target: 'dao',
            data: { excludeFromLayout: true },
        } satisfies Edge;

        const { nodes: excludedLayoutNodes, edges } = getLayoutedElements(
            nodes,
            [excludedEdge],
            { direction: 'TB' },
        );
        const { nodes: includedLayoutNodes } = getLayoutedElements(
            nodes,
            [{ ...excludedEdge, data: {} }],
            { direction: 'TB' },
        );
        const excludedNodeById = new Map(
            excludedLayoutNodes.map((node) => [node.id, node]),
        );
        const includedNodeById = new Map(
            includedLayoutNodes.map((node) => [node.id, node]),
        );

        expect(edges).toEqual([excludedEdge]);
        expect(excludedNodeById.get('dao')!.position.y).toBeLessThan(
            excludedNodeById.get('self-stack')!.position.y,
        );
        expect(includedNodeById.get('dao')!.position.y).toBeGreaterThan(
            includedNodeById.get('self-stack')!.position.y,
        );
    });
});
