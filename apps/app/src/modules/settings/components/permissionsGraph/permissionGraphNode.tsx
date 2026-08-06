import { Avatar, DaoAvatar, Tag } from '@aragon/gov-ui-kit';
import type { NodeProps } from '@xyflow/react';
import classNames from 'classnames';
import { PermissionEntityExternalBrandId } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { ANY_ADDR } from '../../constants/permissionSentinels';
import type { IPermissionGraphNode, PermissionNodeKind } from '../../types';
import { MembersAvatarIcon, SafeAccountAvatar } from '../permissionEntityIcons';
import { PermissionGraphHandles } from './permissionGraphHandles';
import type {
    IPermissionFlowNode,
    PermissionNodeSelectionRole,
} from './permissionGraphNodeTypes';

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
        address,
        selectionRole,
        active,
        dimmed,
    } = data;
    const isDaoKind = kind === 'dao' || kind === 'linkedDao';
    const isSafeBody = brandId === PermissionEntityExternalBrandId.SAFE;
    const isAnyoneActor =
        kind === 'actor' && address.toLowerCase() === ANY_ADDR.toLowerCase();
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
                <PermissionGraphHandles />
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
                {isSafeBody && <SafeAccountAvatar />}
                {kind === 'plugin' && !isSafeBody && tag != null && (
                    <Tag className="self-start" label={tag} variant="primary" />
                )}
                {isAnyoneActor && !isSafeBody && <MembersAvatarIcon />}
                {kind === 'actor' && !isSafeBody && !isAnyoneActor && (
                    <Avatar size="sm" />
                )}
            </div>
        </div>
    );
};
