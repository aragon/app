import {
    BaseEdge,
    type Edge,
    EdgeLabelRenderer,
    type EdgeProps,
    getSmoothStepPath,
} from '@xyflow/react';
import classNames from 'classnames';
import { useTranslations } from '@/shared/components/translationsProvider';

/**
 * A single permission carried by an edge label. Multiple permissions between the
 * same two nodes are stacked vertically so every one stays legible.
 */
export interface IPermissionEdgeEntry {
    /**
     * Id of the underlying graph edge, passed back to `onSelect`.
     */
    edgeId: string;
    permissionName: string;
    conditionLabel?: string;
}

/**
 * Data carried by a permission-graph edge: the permissions granted along it and
 * the selection callback invoked when one of their labels is clicked.
 */
export interface IPermissionEdgeData {
    permissions: IPermissionEdgeEntry[];
    /**
     * Whether the labels are dimmed because another edge is selected.
     */
    dimmed?: boolean;
    /**
     * Selects the given permission (invoked when its label is clicked).
     */
    onSelect?: (edgeId: string) => void;
    [key: string]: unknown;
}

/**
 * React Flow edge carrying resolved permission-edge data.
 */
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
    const { t } = useTranslations();

    const [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
    });

    const permissions = data?.permissions ?? [];

    return (
        <>
            <BaseEdge
                markerEnd={markerEnd}
                markerStart={markerStart}
                path={edgePath}
                style={style}
            />
            {permissions.length > 0 && (
                <EdgeLabelRenderer>
                    <div
                        className="nodrag nopan absolute flex flex-col items-center gap-1"
                        style={{
                            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                        }}
                    >
                        {permissions.map((permission) => {
                            const isDimmed = data?.dimmed === true;

                            return (
                                <button
                                    className={classNames(
                                        'pointer-events-auto flex cursor-pointer flex-col items-center gap-0.5 rounded-md px-2 py-1 text-center font-mono text-neutral-0 text-xs',
                                        isDimmed
                                            ? 'bg-neutral-300'
                                            : 'bg-neutral-800',
                                    )}
                                    key={permission.edgeId}
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        data?.onSelect?.(permission.edgeId);
                                    }}
                                    type="button"
                                >
                                    <span>{permission.permissionName}</span>
                                    {permission.conditionLabel != null && (
                                        <span
                                            className={
                                                isDimmed
                                                    ? 'text-neutral-100'
                                                    : 'text-neutral-200'
                                            }
                                        >
                                            {t(
                                                'app.settings.daoPermissionsPage.graphView.edge.condition',
                                                {
                                                    condition:
                                                        permission.conditionLabel,
                                                },
                                            )}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
};
