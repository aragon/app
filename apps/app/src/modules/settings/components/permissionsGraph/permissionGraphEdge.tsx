import {
    BaseEdge,
    type Edge,
    type EdgeProps,
    getSmoothStepPath,
    getStraightPath,
} from '@xyflow/react';

export interface IPermissionEdgeEntry {
    edgeId: string;
    permissionDisplayName: string;
    permissionName: string;
    conditionLabel?: string;
    selected?: boolean;
}

export type PermissionEdgeVisualKind =
    | 'self'
    | 'incoming'
    | 'outgoing'
    | 'other';

export interface IPermissionEdgeData {
    excludeFromLayout?: boolean;
    selfTargetId?: string;
    visualKind: PermissionEdgeVisualKind;
    [key: string]: unknown;
}

export type IPermissionFlowEdge = Edge<IPermissionEdgeData, 'permission'>;

export const PermissionGraphEdge: React.FC<EdgeProps<IPermissionFlowEdge>> = ({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    markerStart,
    markerEnd,
    style,
    data,
}) => {
    const visualKind = data?.visualKind ?? 'other';
    const [edgePath] =
        visualKind === 'self'
            ? getStraightPath({ sourceX, sourceY, targetX, targetY })
            : getSmoothStepPath({
                  sourceX,
                  sourceY,
                  targetX,
                  targetY,
                  sourcePosition,
                  targetPosition,
                  borderRadius: 16,
              });

    return (
        <BaseEdge
            className={visualKind === 'self' ? 'opacity-80' : undefined}
            markerEnd={markerEnd}
            markerStart={markerStart}
            path={edgePath}
            style={style}
        />
    );
};
