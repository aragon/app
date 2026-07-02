import type { Edge, Node } from '@xyflow/react';
import { getLayoutedElements } from './permissionGraphLayout';

const makeNode = (
    id: string,
    measured: { width: number; height: number } = { width: 200, height: 80 },
): Node => ({
    id,
    position: { x: 0, y: 0 },
    data: {},
    measured,
});

describe('getLayoutedElements', () => {
    it('converts dagre center coordinates to top-left using node dimensions', () => {
        const nodes = [makeNode('a', { width: 200, height: 80 })];

        const { nodes: layouted } = getLayoutedElements(nodes, []);

        expect(layouted[0].position).toEqual({ x: 0, y: 0 });
    });

    it('assigns a numeric, non-overlapping position to every node', () => {
        const nodes = [makeNode('a'), makeNode('b')];
        const edges: Edge[] = [{ id: 'e', source: 'a', target: 'b' }];

        const { nodes: layouted } = getLayoutedElements(nodes, edges);

        for (const node of layouted) {
            expect(typeof node.position.x).toBe('number');
            expect(typeof node.position.y).toBe('number');
        }
        expect(layouted[0].position).not.toEqual(layouted[1].position);
    });

    it('returns a new nodes array reference without mutating the input', () => {
        const nodes = [makeNode('a')];

        const result = getLayoutedElements(nodes, []);

        expect(result.nodes).not.toBe(nodes);
        expect(nodes[0].position).toEqual({ x: 0, y: 0 });
    });

    it('places the edge target above its source for BT direction', () => {
        const nodes = [makeNode('a'), makeNode('b')];
        const edges: Edge[] = [{ id: 'e', source: 'a', target: 'b' }];

        const { nodes: layouted } = getLayoutedElements(nodes, edges, {
            direction: 'BT',
        });

        const source = layouted.find((node) => node.id === 'a');
        const target = layouted.find((node) => node.id === 'b');
        expect(target?.position.y).toBeLessThan(source?.position.y ?? 0);
    });
});
