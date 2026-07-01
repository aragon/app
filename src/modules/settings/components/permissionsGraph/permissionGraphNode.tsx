import { Avatar, DaoAvatar, Tag } from '@aragon/gov-ui-kit';
import { Handle, type Node, type NodeProps, Position } from '@xyflow/react';
import classNames from 'classnames';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IPermissionGraphNode, PermissionNodeKind } from '../../types';

/**
 * Role a node plays in the currently selected permission edge.
 */
export type PermissionNodeSelectionRole = 'who' | 'where';

/**
 * Permission-graph node data plus its selection state, widened to satisfy React
 * Flow's `Record<string, unknown>` node-data constraint.
 */
export interface IPermissionNodeData extends IPermissionGraphNode {
    /**
     * Set when this node is the `who` / `where` of the selected edge.
     */
    selectionRole?: PermissionNodeSelectionRole;
    /**
     * Whether the node is dimmed because another edge is selected.
     */
    dimmed?: boolean;
    [key: string]: unknown;
}

/**
 * React Flow node carrying a resolved permission-graph node as its data.
 */
export type IPermissionFlowNode = Node<IPermissionNodeData, 'permission'>;

const SUBTITLE_KEY: Record<PermissionNodeKind, string> = {
    dao: 'app.settings.daoPermissionsPage.graphView.node.primaryDao',
    linkedDao: 'app.settings.daoPermissionsPage.graphView.node.linkedDao',
    plugin: 'app.settings.daoPermissionsPage.graphView.node.plugin',
    actor: 'app.settings.daoPermissionsPage.graphView.node.actor',
};

const SELECTION_LABEL_KEY: Record<PermissionNodeSelectionRole, string> = {
    who: 'app.settings.daoPermissionsPage.graphView.node.who',
    where: 'app.settings.daoPermissionsPage.graphView.node.where',
};

export const PermissionGraphNode: React.FC<NodeProps<IPermissionFlowNode>> = ({
    data,
}) => {
    const { t } = useTranslations();
    const { kind, label, tag, avatarSrc, selectionRole, dimmed } = data;

    const isDaoKind = kind === 'dao' || kind === 'linkedDao';
    const isSelected = selectionRole != null;

    return (
        <div
            className={classNames(
                'relative transition-opacity',
                dimmed === true && 'opacity-30',
            )}
        >
            {isSelected && (
                <span className="absolute top-px left-0 -translate-y-full rounded-t-md border border-primary-400 border-b-0 bg-neutral-0 px-4 py-0.5 font-medium text-neutral-500 text-xs uppercase">
                    {t(SELECTION_LABEL_KEY[selectionRole])}
                </span>
            )}
            <div
                className={classNames(
                    'flex min-w-64 items-center justify-between gap-4 border bg-neutral-0 px-4 py-3',
                    isSelected
                        ? 'rounded-xl rounded-tl-none border-primary-400 shadow-primary-lg'
                        : 'rounded-xl border-neutral-100 shadow-neutral-sm',
                )}
            >
                <Handle
                    className="opacity-0"
                    position={Position.Bottom}
                    type="target"
                />
                <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-neutral-800">{label}</span>
                    <span className="truncate text-neutral-500 text-sm">
                        {t(SUBTITLE_KEY[kind])}
                    </span>
                </div>
                {isDaoKind && (
                    <DaoAvatar
                        name={label}
                        size="sm"
                        src={avatarSrc ?? undefined}
                    />
                )}
                {kind === 'plugin' && tag != null && (
                    <Tag className="self-start" label={tag} variant="primary" />
                )}
                {kind === 'actor' && <Avatar size="sm" />}
                <Handle
                    className="opacity-0"
                    position={Position.Top}
                    type="source"
                />
            </div>
        </div>
    );
};
