import {
    BaseEdge,
    type Edge,
    type EdgeProps,
    getSmoothStepPath,
    getStraightPath,
    type Position,
} from '@xyflow/react';

const EDGE_PATH_BORDER_RADIUS = 12;
const EDGE_PATH_OFFSET = 28;

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
export type PermissionStackConnection = 'origin' | 'target';

export interface IPermissionEdgeData {
    excludeFromLayout?: boolean;
    selfTargetId?: string;
    lockHandles?: boolean;
    layoutSource?: string;
    layoutTarget?: string;
    visualKind: PermissionEdgeVisualKind;
    permissionStackId?: string;
    stackConnection?: PermissionStackConnection;
    [key: string]: unknown;
}

export type IPermissionFlowEdge = Edge<IPermissionEdgeData, 'permission'>;

interface IGetPermissionEdgePathParams {
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
    sourcePosition?: Position;
    targetPosition?: Position;
    visualKind: PermissionEdgeVisualKind;
}

export const getPermissionEdgePath = ({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
}: IGetPermissionEdgePathParams): string => {
    if (sourcePosition == null || targetPosition == null) {
        return getStraightPath({ sourceX, sourceY, targetX, targetY })[0];
    }

    return getSmoothStepPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
        borderRadius: EDGE_PATH_BORDER_RADIUS,
        offset: EDGE_PATH_OFFSET,
    })[0];
};

export const PermissionGraphEdge: React.FC<EdgeProps<IPermissionFlowEdge>> = ({
    sourceX,
    sourceY,
    targetX,
    targetY,
    markerStart,
    markerEnd,
    style,
    sourcePosition,
    targetPosition,
    data,
}) => {
    const visualKind = data?.visualKind ?? 'other';
    const edgePath = getPermissionEdgePath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
        visualKind,
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
