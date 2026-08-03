import { getSmoothStepPath, getStraightPath, Position } from '@xyflow/react';
import { getPermissionEdgePath } from './permissionGraphEdge';

describe('getPermissionEdgePath', () => {
    const coordinates = {
        sourceX: 0,
        sourceY: 0,
        targetX: 300,
        targetY: 120,
    };

    it.each([
        {
            name: 'keeps incoming permission tridents on the curved smooth-step path',
            positions: {
                sourcePosition: Position.Top,
                targetPosition: Position.Bottom,
            },
            visualKind: 'incoming',
        },
        {
            name: 'uses curved side-aware paths for supporting and mixed graph edges',
            positions: {
                sourcePosition: Position.Right,
                targetPosition: Position.Left,
            },
            visualKind: 'other',
        },
    ] as const)('$name', ({ positions, visualKind }) => {
        const [smoothStepPath] = getSmoothStepPath({
            ...coordinates,
            ...positions,
            borderRadius: 12,
            offset: 28,
        });

        expect(
            getPermissionEdgePath({
                ...coordinates,
                ...positions,
                visualKind,
            }),
        ).toBe(smoothStepPath);
    });

    it('uses the direct path when handle positions are unavailable', () => {
        const [straightPath] = getStraightPath(coordinates);

        expect(
            getPermissionEdgePath({
                ...coordinates,
                visualKind: 'other',
            }),
        ).toBe(straightPath);
    });
});
