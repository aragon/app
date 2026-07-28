import { getStraightPath, Position } from '@xyflow/react';
import { getPermissionEdgePath } from './permissionGraphEdge';

describe('getPermissionEdgePath', () => {
    const coordinates = {
        sourceX: 0,
        sourceY: 0,
        targetX: 300,
        targetY: 120,
    };

    it('keeps incoming permission tridents orthogonal without curve segments', () => {
        const path = getPermissionEdgePath({
            ...coordinates,
            sourcePosition: Position.Top,
            targetPosition: Position.Bottom,
            visualKind: 'incoming',
        });

        expect(path).toMatch(/^M/);
        expect(path).not.toContain('Q');
    });

    it('uses the direct shortest path for supporting and mixed graph edges', () => {
        const [straightPath] = getStraightPath(coordinates);

        expect(
            getPermissionEdgePath({
                ...coordinates,
                visualKind: 'other',
            }),
        ).toBe(straightPath);
    });
});
