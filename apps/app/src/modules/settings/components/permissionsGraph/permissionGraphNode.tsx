import { Avatar, DaoAvatar, Tag } from '@aragon/gov-ui-kit';
import { Handle, type Node, type NodeProps, Position } from '@xyflow/react';
import classNames from 'classnames';
import safeWallet from '@/assets/images/safeWallet.png';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IPermissionGraphNode, PermissionNodeKind } from '../../types';
import type { IPermissionEdgeEntry } from './permissionGraphEdge';

export type PermissionNodeSelectionRole = 'who' | 'where';

export interface IPermissionNodeData extends IPermissionGraphNode {
    selectionRole?: PermissionNodeSelectionRole;
    active?: boolean;
    dimmed?: boolean;
    sourcePosition?: Position;
    targetPosition?: Position;
    [key: string]: unknown;
}

export type IPermissionFlowNode = Node<IPermissionNodeData, 'permission'>;

export interface IPermissionStackNodeData {
    sourceId?: string;
    targetId?: string;
    visualKind?: PermissionNodeKind | string;
    permissions: IPermissionEdgeEntry[];
    active?: boolean;
    dimmed?: boolean;
    sourcePosition?: Position;
    targetPosition?: Position;
    onSelect?: (edgeId: string) => void;
    [key: string]: unknown;
}

export type IPermissionStackFlowNode = Node<
    IPermissionStackNodeData,
    'permissionStack'
>;

export const PERMISSION_GRAPH_HANDLE = {
    sourceTop: 'source-top',
    sourceRight: 'source-right',
    sourceBottom: 'source-bottom',
    sourceLeft: 'source-left',
    targetTop: 'target-top',
    targetRight: 'target-right',
    targetBottom: 'target-bottom',
    targetLeft: 'target-left',
} as const;

const SOURCE_HANDLES = [
    { id: PERMISSION_GRAPH_HANDLE.sourceTop, position: Position.Top },
    { id: PERMISSION_GRAPH_HANDLE.sourceRight, position: Position.Right },
    { id: PERMISSION_GRAPH_HANDLE.sourceBottom, position: Position.Bottom },
    { id: PERMISSION_GRAPH_HANDLE.sourceLeft, position: Position.Left },
];

const TARGET_HANDLES = [
    { id: PERMISSION_GRAPH_HANDLE.targetTop, position: Position.Top },
    { id: PERMISSION_GRAPH_HANDLE.targetRight, position: Position.Right },
    { id: PERMISSION_GRAPH_HANDLE.targetBottom, position: Position.Bottom },
    { id: PERMISSION_GRAPH_HANDLE.targetLeft, position: Position.Left },
];

const HiddenHandles = () => (
    <>
        {TARGET_HANDLES.map((handle) => (
            <Handle
                className="pointer-events-none size-0 border-0 bg-transparent opacity-0"
                id={handle.id}
                key={handle.id}
                position={handle.position}
                type="target"
            />
        ))}
        {SOURCE_HANDLES.map((handle) => (
            <Handle
                className="pointer-events-none size-0 border-0 bg-transparent opacity-0"
                id={handle.id}
                key={handle.id}
                position={handle.position}
                type="source"
            />
        ))}
    </>
);

const SUBTITLE_KEY: Record<PermissionNodeKind, string> = {
    dao: 'app.settings.daoPermissionsPage.graphView.node.dao',
    linkedDao: 'app.settings.daoPermissionsPage.graphView.node.linkedDao',
    plugin: 'app.settings.daoPermissionsPage.graphView.node.plugin',
    actor: 'app.settings.daoPermissionsPage.graphView.node.actor',
};

const SELECTION_LABEL_KEY: Record<PermissionNodeSelectionRole, string> = {
    who: 'app.settings.daoPermissionsPage.graphView.node.who',
    where: 'app.settings.daoPermissionsPage.graphView.node.where',
};

type PermissionNodeTypeInput = Pick<
    IPermissionGraphNode,
    'kind' | 'layer' | 'status'
>;

export const getPermissionNodeTypeKey = (
    data: PermissionNodeTypeInput,
): string => {
    if (data.kind === 'plugin') {
        if (data.status === 'uninstalled') {
            return 'app.settings.daoPermissionsPage.graphView.node.uninstalledPlugin';
        }

        if (data.status === 'historical' || data.layer === 'historicalPlugin') {
            return 'app.settings.daoPermissionsPage.graphView.node.historicalPlugin';
        }
    }

    return SUBTITLE_KEY[data.kind];
};

export const PermissionGraphNode: React.FC<NodeProps<IPermissionFlowNode>> = ({
    data,
}) => {
    const { t } = useTranslations();
    const {
        kind,
        label,
        tag,
        avatarSrc,
        brandId,
        selectionRole,
        active,
        dimmed,
    } = data;
    const isDaoKind = kind === 'dao' || kind === 'linkedDao';
    const isSafeBody = kind === 'plugin' && brandId === 'safe';
    const isSelected = selectionRole != null || active === true;
    const subtitleKey = getPermissionNodeTypeKey(data);

    return (
        <div
            className={classNames(
                'relative transition-opacity',
                dimmed === true && 'opacity-30',
            )}
        >
            {selectionRole != null && (
                <span className="absolute top-px left-0 -translate-y-full rounded-t-md border border-primary-400 border-b-0 bg-neutral-0 px-4 py-0.5 font-medium text-neutral-500 text-xs uppercase">
                    {t(SELECTION_LABEL_KEY[selectionRole])}
                </span>
            )}
            <div
                className={classNames(
                    'flex min-w-64 cursor-pointer items-center justify-between gap-4 border bg-neutral-0 px-4 py-3 transition-colors hover:border-primary-300',
                    isSelected && 'border-primary-400 shadow-primary-lg',
                    selectionRole != null
                        ? 'rounded-xl rounded-tl-none'
                        : 'rounded-xl',
                    !isSelected && 'border-neutral-300 shadow-neutral-sm',
                )}
            >
                <HiddenHandles />
                <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-neutral-800">{label}</span>
                    <span className="truncate text-neutral-500 text-sm">
                        {t(subtitleKey)}
                    </span>
                </div>
                {isDaoKind && (
                    <DaoAvatar
                        name={label}
                        size="sm"
                        src={avatarSrc ?? undefined}
                    />
                )}
                {isSafeBody && (
                    <Avatar
                        className="shrink-0"
                        size="sm"
                        src={safeWallet.src}
                    />
                )}
                {kind === 'plugin' && !isSafeBody && tag != null && (
                    <Tag className="self-start" label={tag} variant="primary" />
                )}
                {kind === 'actor' && <Avatar size="sm" />}
            </div>
        </div>
    );
};

export const PermissionStackNode: React.FC<
    NodeProps<IPermissionStackFlowNode>
> = ({ data }) => {
    const { t } = useTranslations();
    const { permissions, active, dimmed, onSelect } = data;

    return (
        <div
            className={classNames(
                'nodrag nopan relative flex w-fit flex-col items-center gap-0.5',
                dimmed === true && 'opacity-50',
            )}
        >
            <HiddenHandles />
            {permissions.map((permission) => {
                const isSelected = active && permission.selected === true;

                return (
                    <button
                        className={classNames(
                            'pointer-events-auto flex max-w-60 cursor-pointer flex-col items-center gap-0.5 rounded border px-1.5 py-0.5 text-center font-mono text-[10px] shadow-neutral-sm transition-colors',
                            permission.conditionLabel != null && 'pb-1',
                            isSelected
                                ? 'border-primary-500 bg-primary-500 text-neutral-0'
                                : dimmed
                                  ? 'border-neutral-200 bg-neutral-200 text-neutral-500'
                                  : 'border-neutral-700 bg-neutral-800 text-neutral-0 hover:border-primary-300 hover:bg-neutral-700',
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
                                    'rounded bg-neutral-0 px-1',
                                    isSelected
                                        ? 'text-primary-700'
                                        : dimmed
                                          ? 'text-neutral-500'
                                          : 'text-neutral-800',
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
