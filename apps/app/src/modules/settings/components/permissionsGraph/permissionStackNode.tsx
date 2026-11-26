import type { NodeProps } from '@xyflow/react';
import classNames from 'classnames';
import { useTranslations } from '@/shared/components/translationsProvider';
import { PermissionGraphHandles } from './permissionGraphHandles';
import type { IPermissionStackFlowNode } from './permissionGraphNodeTypes';

export const PermissionStackNode: React.FC<
    NodeProps<IPermissionStackFlowNode>
> = ({ data }) => {
    const { t } = useTranslations();
    const { permissions, active, dimmed, onSelect } = data;

    return (
        <div
            className={classNames(
                'nodrag nopan relative flex w-fit flex-col items-center gap-tight--fixed-2',
                dimmed === true && 'opacity-50',
            )}
        >
            <PermissionGraphHandles />
            {permissions.map((permission) => {
                const isSelected = active && permission.selected === true;

                return (
                    <button
                        className={classNames(
                            // biome-ignore lint/plugin/noPrimitiveTypography: node labels follow the node size, not a type role
                            'pointer-events-auto flex max-w-60 cursor-pointer flex-col items-center gap-tight--fixed-2 rounded border px-inset-tight--fixed-6 py-inset-tight text-center type-mono text-[10px] shadow-surface-sm transition-colors',
                            permission.conditionLabel != null &&
                                'pb-inset-tight--fixed-4',
                            isSelected
                                ? // biome-ignore lint/plugin/noPrimitiveColors: no border role has primary-500
                                  'border-primary-500 bg-primary-500 text-accent-inverse'
                                : dimmed
                                  ? // biome-ignore lint/plugin/noPrimitiveColors: no role for a dimmed chip at neutral-200 (bg/surface/disabled is neutral-100)
                                    'border-neutral-200 bg-neutral-200 text-surface-secondary'
                                  : // biome-ignore lint/plugin/noPrimitiveColors: no border or bg role has neutral-700
                                    'border-neutral-700 bg-neutral-800 text-neutral-0 hover:border-primary-300 hover:bg-neutral-700',
                        )}
                        key={permission.edgeId}
                        onClick={(event) => {
                            event.stopPropagation();
                            onSelect?.(permission.edgeId);
                        }}
                        title={permission.permissionName}
                        type="button"
                    >
                        <span className="max-w-56 truncate">
                            {permission.permissionDisplayName}
                        </span>
                        {permission.conditionLabel != null && (
                            <span
                                className={classNames(
                                    'rounded bg-surface-primary px-inset-tight--fixed-4',
                                    isSelected
                                        ? // biome-ignore lint/plugin/noPrimitiveColors: no text/accent role at primary-700
                                          'text-primary-700'
                                        : dimmed
                                          ? 'text-surface-secondary'
                                          : 'text-surface-primary',
                                )}
                            >
                                {t(
                                    'app.settings.daoPermissionsPage.graphView.edge.condition',
                                    {
                                        condition: permission.conditionLabel,
                                    },
                                )}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
};
