import {
    BaseEdge,
    type Edge,
    type EdgeProps,
    getSmoothStepPath,
    getStraightPath,
    type Position,
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

interface IGetPermissionEdgePathParams {
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
    sourcePosition?: Position;
    targetPosition?: Position;
    visualKind: PermissionEdgeVisualKind;
}
const DEGENERATE_CURVE_REGEX = /Q (-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?) \1,\2/g;

const removeDegenerateCurves = (path: string): string =>
    path.replaceAll(DEGENERATE_CURVE_REGEX, '');

export const getPermissionEdgePath = ({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    visualKind,
}: IGetPermissionEdgePathParams): string => {
    if (visualKind === 'incoming') {
        const [path] = getSmoothStepPath({
            sourceX,
            sourceY,
            targetX,
            targetY,
            sourcePosition,
            targetPosition,
            borderRadius: 0,
        });

        return removeDegenerateCurves(path);
    }

    return getStraightPath({ sourceX, sourceY, targetX, targetY })[0];
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
