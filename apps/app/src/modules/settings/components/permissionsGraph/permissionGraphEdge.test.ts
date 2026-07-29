import { getSmoothStepPath, getStraightPath, Position } from '@xyflow/react';
import { getPermissionEdgePath } from './permissionGraphEdge';

describe('getPermissionEdgePath', () => {
    const coordinates = {
        sourceX: 0,
        sourceY: 0,
        targetX: 300,
        targetY: 120,
    };

    it('keeps incoming permission tridents on the curved smooth-step path', () => {
        const [smoothStepPath] = getSmoothStepPath({
            ...coordinates,
            sourcePosition: Position.Top,
            targetPosition: Position.Bottom,
            borderRadius: 12,
            offset: 28,
        });

        expect(
            getPermissionEdgePath({
                ...coordinates,
                sourcePosition: Position.Top,
                targetPosition: Position.Bottom,
                visualKind: 'incoming',
            }),
        ).toBe(smoothStepPath);
    });

    it('uses curved side-aware paths for supporting and mixed graph edges', () => {
        const [smoothStepPath] = getSmoothStepPath({
            ...coordinates,
            sourcePosition: Position.Right,
            targetPosition: Position.Left,
            borderRadius: 12,
            offset: 28,
        });

        expect(
            getPermissionEdgePath({
                ...coordinates,
                sourcePosition: Position.Right,
                targetPosition: Position.Left,
                visualKind: 'other',
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
