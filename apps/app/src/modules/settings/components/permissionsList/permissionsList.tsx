'use client';

import {
    Accordion,
    addressUtils,
    CardEmptyState,
    ChainEntityType,
    DaoAvatar,
    DefinitionList,
    Icon,
    IconType,
    StateSkeletonBar,
    StateSkeletonCircular,
    Tag,
    Tooltip,
    useBlockExplorer,
} from '@aragon/gov-ui-kit';
import type { IDaoPlugin, Network } from '@/shared/api/daoService';
import type { IFilterComponentPlugin } from '@/shared/components/pluginFilterComponent';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { permissionNameUtils } from '@/shared/utils/permissionNameUtils';
import { SettingsSlotId } from '../../constants/moduleSlots';
import { ALLOW_FLAG, ANY_ADDR } from '../../constants/permissionSentinels';
import type { IPermissionRow } from '../../types';
import {
    conditionTypeUtils,
    UNKNOWN_CONDITION,
} from '../../utils/conditionTypeUtils';
import {
    type IPermissionAccountRef,
    type IPermissionEntity,
    permissionEntityUtils,
} from '../../utils/permissionEntityUtils';
import { NoConditionSlot } from '../noConditionSlot';
import { MembersAvatarIcon, SafeAccountAvatar } from '../permissionEntityIcons';
import { PermissionDetailCard } from '../permissionsGraph/permissionDetailPanel';
import { UnrecognizedConditionSlot } from '../unrecognizedConditionSlot';

type DaoPlugins = IFilterComponentPlugin<IDaoPlugin>[] | undefined;

export interface IPermissionsListProps {
    rows: IPermissionRow[];
    accountRefs: IPermissionAccountRef[];
    daoPlugins?: DaoPlugins;
    chainId?: number;
    isLoading: boolean;
    expandedRows: string[];
    onExpandedRowsChange: (rows: string[]) => void;
}

const SKELETON_ROW_KEYS = [
    'skeleton-1',
    'skeleton-2',
    'skeleton-3',
    'skeleton-4',
];

export const getPermissionRowKey = (row: IPermissionRow): string => {
    const conditionAddress = row.conditionAddress ?? ALLOW_FLAG;

    return `${row.permissionId}-${row.whoAddress.toLowerCase()}-${row.whereAddress.toLowerCase()}-${conditionAddress.toLowerCase()}`;
};

export const PermissionsList: React.FC<IPermissionsListProps> = (props) => {
    const {
        rows,
        accountRefs,
        daoPlugins,
        chainId,
        isLoading,
        expandedRows,
        onExpandedRowsChange,
    } = props;

    const { t } = useTranslations();

    if (isLoading) {
        return <PermissionsListSkeleton />;
    }

    if (rows.length === 0) {
        return (
            <CardEmptyState
                description={t(
                    'app.settings.permissionsList.empty.description',
                )}
                heading={t('app.settings.permissionsList.empty.heading')}
                objectIllustration={{ object: 'SETTINGS' }}
            />
        );
    }

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 md:hidden">
                {rows.map((row) => (
                    <PermissionsListMobileCard
                        accounts={accountRefs}
                        chainId={chainId}
                        daoPlugins={daoPlugins}
                        key={getPermissionRowKey(row)}
                        network={row.network}
                        row={row}
                        rowKey={getPermissionRowKey(row)}
                    />
                ))}
            </div>
            <div className="hidden flex-col gap-3 md:flex">
                <PermissionsListHeader />
                <Accordion.Container
                    isMulti={true}
                    onValueChange={(value) => onExpandedRowsChange(value ?? [])}
                    value={expandedRows}
                >
                    {rows.map((row) => (
                        <PermissionsListRow
                            accounts={accountRefs}
                            chainId={chainId}
                            daoPlugins={daoPlugins}
                            key={getPermissionRowKey(row)}
                            network={row.network}
                            row={row}
                            rowKey={getPermissionRowKey(row)}
                        />
                    ))}
                </Accordion.Container>
            </div>
        </div>
    );
};

interface IPermissionsListRowProps {
    row: IPermissionRow;
    rowKey: string;
    daoPlugins: DaoPlugins;
    accounts: IPermissionAccountRef[];
    chainId?: number;
    network?: Network;
}

interface IPermissionEntityCellProps {
    entity: IPermissionEntity;
}

const PermissionEntityCell: React.FC<IPermissionEntityCellProps> = ({
    entity,
}) => (
    <span className="flex min-w-0 items-center gap-2 text-neutral-800">
        <span className="truncate">{entity.label}</span>
        {entity.type === 'dao' && (
            <DaoAvatar name={entity.label} size="sm" src={entity.avatarSrc} />
        )}
        {entity.brandId === 'safe' && <SafeAccountAvatar />}
        {entity.type === 'plugin' &&
            entity.brandId !== 'safe' &&
            entity.tag != null && (
                <Tag
                    className="max-w-[140px] shrink-0 [&>p]:truncate"
                    label={entity.tag}
                    variant="primary"
                />
            )}
        {entity.type === 'sentinel' &&
            (addressUtils.isAddressEqual(entity.address, ANY_ADDR) ? (
                <MembersAvatarIcon />
            ) : (
                <span
                    aria-hidden="true"
                    className="size-6 shrink-0 rounded-full bg-neutral-100"
                />
            ))}
    </span>
);

interface IPermissionAddressListItemProps {
    address: string;
    term: string;
    name?: string;
    chainId?: number;
}

const PermissionAddressListItem: React.FC<IPermissionAddressListItemProps> = ({
    address,
    term,
    name,
    chainId,
}) => {
    const { buildEntityUrl } = useBlockExplorer({ chainId });
    const truncatedAddress = addressUtils.truncateAddress(address);
    const explorerUrl = buildEntityUrl({
        type: ChainEntityType.ADDRESS,
        id: address,
    });
    const description = name !== truncatedAddress ? name : undefined;

    return (
        <DefinitionList.Item
            copyValue={address}
            description={description}
            link={{ href: explorerUrl, isExternal: true }}
            term={term}
        >
            {truncatedAddress}
        </DefinitionList.Item>
    );
};

interface IPermissionEntityListItemProps {
    entity: IPermissionEntity;
    term: string;
    chainId?: number;
}

const PermissionEntityListItem: React.FC<IPermissionEntityListItemProps> = ({
    entity,
    term,
    chainId,
}) => {
    if (entity.isSentinel) {
        return (
            <DefinitionList.Item
                copyValue={entity.address}
                description={addressUtils.truncateAddress(entity.address)}
                term={term}
            >
                {entity.label}
            </DefinitionList.Item>
        );
    }

    return (
        <PermissionAddressListItem
            address={entity.address}
            chainId={chainId}
            name={entity.detailName}
            term={term}
        />
    );
};

const PermissionsListMobileCard: React.FC<IPermissionsListRowProps> = (
    props,
) => {
    const { row, daoPlugins, accounts, chainId, network } = props;

    const resolveOptions = { daoPlugins, accounts };
    const who = permissionEntityUtils.resolvePermissionEntity(row.whoAddress, {
        ...resolveOptions,
        entity: row.who,
    });
    const where = permissionEntityUtils.resolvePermissionEntity(
        row.whereAddress,
        {
            ...resolveOptions,
            entity: row.where,
        },
    );
    const permissionName = permissionNameUtils.getPermissionName(
        row.permissionId,
    );
    const conditionAddress = row.conditionAddress ?? ALLOW_FLAG;
    const conditionType = conditionTypeUtils.resolveConditionType(
        conditionAddress,
        row.condition,
    );
    const conditionLabel = conditionTypeUtils.getConditionLabel(conditionType);
    const hasCondition = !addressUtils.isAddressEqual(
        conditionAddress,
        ALLOW_FLAG,
    );

    return (
        <PermissionDetailCard
            chainId={chainId}
            className="flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-neutral-0 shadow-neutral-md"
            conditionLabel={hasCondition ? conditionLabel : undefined}
            network={network}
            permissionName={permissionName}
            row={row}
            where={where}
            who={who}
        />
    );
};

const PermissionsListRow: React.FC<IPermissionsListRowProps> = (props) => {
    const { row, rowKey, daoPlugins, accounts, chainId, network } = props;

    const { t } = useTranslations();

    const resolveOptions = { daoPlugins, accounts };
    const who = permissionEntityUtils.resolvePermissionEntity(row.whoAddress, {
        ...resolveOptions,
        entity: row.who,
    });
    const where = permissionEntityUtils.resolvePermissionEntity(
        row.whereAddress,
        {
            ...resolveOptions,
            entity: row.where,
        },
    );
    const permissionName = permissionNameUtils.getPermissionName(
        row.permissionId,
    );
    const conditionAddress = row.conditionAddress ?? ALLOW_FLAG;
    const conditionType = conditionTypeUtils.resolveConditionType(
        conditionAddress,
        row.condition,
    );
    const conditionLabel = conditionTypeUtils.getConditionLabel(conditionType);
    const hasConditionLabel = conditionLabel !== '-';
    const hasUnrecognizedCondition = conditionType === UNKNOWN_CONDITION;

    const hasCondition = !addressUtils.isAddressEqual(
        conditionAddress,
        ALLOW_FLAG,
    );

    return (
        <Accordion.Item value={rowKey}>
            <Accordion.ItemHeader>
                <div className="grid w-full grid-cols-4 items-center gap-4 text-left">
                    <PermissionEntityCell entity={who} />
                    <PermissionEntityCell entity={where} />
                    <span className="min-w-0 truncate font-mono text-neutral-800">
                        {permissionName}
                    </span>
                    <span className="flex min-w-0 overflow-hidden">
                        {hasConditionLabel ? (
                            <Tag
                                className="max-w-full [&>p]:truncate"
                                label={conditionLabel}
                            />
                        ) : (
                            <span className="text-neutral-800">
                                {conditionLabel}
                            </span>
                        )}
                    </span>
                </div>
            </Accordion.ItemHeader>
            <Accordion.ItemContent>
                <div className="flex flex-col gap-6 md:flex-row md:gap-8">
                    <div className="flex flex-1 flex-col gap-3">
                        <p className="text-lg text-neutral-800 leading-tight">
                            {t('app.settings.permissionsList.details.heading')}
                        </p>
                        <DefinitionList.Container>
                            <PermissionEntityListItem
                                chainId={chainId}
                                entity={who}
                                term={t(
                                    'app.settings.permissionsList.details.who',
                                )}
                            />
                            <PermissionEntityListItem
                                chainId={chainId}
                                entity={where}
                                term={t(
                                    'app.settings.permissionsList.details.where',
                                )}
                            />
                            <DefinitionList.Item
                                copyValue={row.permissionId}
                                description={permissionName}
                                term={t(
                                    'app.settings.permissionsList.details.permission',
                                )}
                            >
                                {addressUtils.truncateHash(row.permissionId)}
                            </DefinitionList.Item>
                            {hasCondition ? (
                                <PermissionAddressListItem
                                    address={conditionAddress}
                                    chainId={chainId}
                                    name={conditionLabel}
                                    term={t(
                                        'app.settings.permissionsList.details.condition',
                                    )}
                                />
                            ) : (
                                <DefinitionList.Item
                                    term={t(
                                        'app.settings.permissionsList.details.condition',
                                    )}
                                >
                                    {conditionLabel}
                                </DefinitionList.Item>
                            )}
                        </DefinitionList.Container>
                    </div>
                    <div className="flex flex-1 flex-col gap-3">
                        <p className="text-lg text-neutral-800 leading-tight">
                            {t(
                                'app.settings.permissionsList.condition.heading',
                            )}
                        </p>
                        {hasUnrecognizedCondition ? (
                            <UnrecognizedConditionSlot
                                chainId={chainId}
                                conditionAddress={conditionAddress}
                            />
                        ) : (
                            <PluginSingleComponent
                                chainId={chainId}
                                conditionAddress={conditionAddress}
                                Fallback={NoConditionSlot}
                                network={network}
                                pluginAddress={row.whoAddress}
                                pluginId={conditionType}
                                slotId={SettingsSlotId.PERMISSION_CONDITION}
                                {...row.condition}
                            />
                        )}
                    </div>
                </div>
            </Accordion.ItemContent>
        </Accordion.Item>
    );
};

interface IPermissionsListHeaderLabelProps {
    labelKey: string;
    tooltipKey: string;
    tooltipLabelKey: string;
}

const PermissionsListHeaderLabel: React.FC<IPermissionsListHeaderLabelProps> = (
    props,
) => {
    const { labelKey, tooltipKey, tooltipLabelKey } = props;
    const { t } = useTranslations();
    const label = t(labelKey);
    const tooltip = t(tooltipKey);

    return (
        <span className="flex min-w-0 items-center gap-1">
            <span className="truncate">{label}</span>
            <Tooltip content={tooltip} triggerAsChild={true}>
                <span
                    aria-label={`${t(tooltipLabelKey)}: ${tooltip}`}
                    className="inline-flex size-5 shrink-0 cursor-help items-center justify-center text-neutral-400 leading-none"
                    role="img"
                >
                    <Icon icon={IconType.INFO} size="sm" />
                </span>
            </Tooltip>
        </span>
    );
};

const PermissionsListHeader: React.FC = () => {
    const { t } = useTranslations();

    return (
        <div className="sticky top-[90px] z-20 -mx-4 hidden md:-mx-6 md:block">
            <div className="flex items-baseline justify-between gap-x-4 bg-gradient-to-b from-90% from-neutral-50 to-transparent px-8 pt-1 pb-4 text-neutral-500 text-sm md:gap-x-6 md:px-12">
                <div className="grid w-full grid-cols-4 gap-4">
                    <PermissionsListHeaderLabel
                        labelKey="app.settings.permissionsList.header.who"
                        tooltipKey="app.settings.permissionsList.header.whoTooltip"
                        tooltipLabelKey="app.settings.permissionsList.header.whoTooltipLabel"
                    />
                    <PermissionsListHeaderLabel
                        labelKey="app.settings.permissionsList.header.where"
                        tooltipKey="app.settings.permissionsList.header.whereTooltip"
                        tooltipLabelKey="app.settings.permissionsList.header.whereTooltipLabel"
                    />
                    <span>
                        {t('app.settings.permissionsList.header.permission')}
                    </span>
                    <span>
                        {t('app.settings.permissionsList.header.condition')}
                    </span>
                </div>
                <span aria-hidden="true" className="size-6 shrink-0" />
            </div>
        </div>
    );
};

const PermissionsListSkeleton: React.FC = () => (
    <div
        className="flex flex-col gap-3"
        data-testid="permissions-list-skeleton"
    >
        <PermissionsListHeader />
        {SKELETON_ROW_KEYS.map((rowKey) => (
            <div
                className="flex items-center justify-between gap-x-4 rounded-xl border border-neutral-100 bg-neutral-0 px-4 py-3 md:gap-x-6 md:px-6 md:py-5"
                key={rowKey}
            >
                <div className="grid w-full grid-cols-2 items-center gap-2 md:grid-cols-4 md:gap-4">
                    <StateSkeletonBar width="58%" />
                    <StateSkeletonBar width="50%" />
                    <StateSkeletonBar width="72%" />
                    <StateSkeletonBar width="44%" />
                </div>
                <StateSkeletonCircular className="shrink-0" size="sm" />
            </div>
        ))}
    </div>
);
