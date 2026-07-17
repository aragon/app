import {
    BaseEdge,
    type Edge,
    type EdgeProps,
    getSmoothStepPath,
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

const getEdgeBorderRadius = (visualKind: PermissionEdgeVisualKind) =>
    visualKind === 'self' ? 0 : 16;

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
    const [edgePath] = getSmoothStepPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
        borderRadius: getEdgeBorderRadius(visualKind),
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
