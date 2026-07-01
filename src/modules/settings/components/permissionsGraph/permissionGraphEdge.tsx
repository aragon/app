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
 * Data carried by a permission-graph edge: the resolved permission name and an
 * optional condition label rendered as an `if <label>` suffix.
 */
export interface IPermissionEdgeData {
    permissionName: string;
    conditionLabel?: string;
    /**
     * Whether the edge is dimmed because another edge is selected.
     */
    dimmed?: boolean;
    /**
     * Selects this edge (invoked when its label is clicked).
     */
    onSelect?: () => void;
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

    return (
        <>
            <BaseEdge markerEnd={markerEnd} path={edgePath} style={style} />
            <EdgeLabelRenderer>
                <button
                    className={classNames(
                        'nodrag nopan pointer-events-auto absolute flex cursor-pointer flex-col items-center gap-0.5 rounded-md bg-neutral-800 px-2 py-1 text-center font-mono text-neutral-0 text-xs',
                        data?.dimmed === true && 'opacity-20',
                    )}
                    onClick={(event) => {
                        event.stopPropagation();
                        data?.onSelect?.();
                    }}
                    style={{
                        transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                    }}
                    type="button"
                >
                    <span>{data?.permissionName}</span>
                    {data?.conditionLabel != null && (
                        <span className="text-neutral-200">
                            {t(
                                'app.settings.daoPermissionsPage.graphView.edge.condition',
                                { condition: data.conditionLabel },
                            )}
                        </span>
                    )}
                </button>
            </EdgeLabelRenderer>
        </>
    );
};
