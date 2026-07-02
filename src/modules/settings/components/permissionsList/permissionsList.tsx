'use client';

import {
    Accordion,
    addressUtils,
    CardEmptyState,
    ChainEntityType,
    DaoAvatar,
    DefinitionList,
    Link,
    StateSkeletonBar,
    Tag,
    useBlockExplorer,
} from '@aragon/gov-ui-kit';
import type { IDaoPlugin } from '@/shared/api/daoService';
import type { IFilterComponentPlugin } from '@/shared/components/pluginFilterComponent';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { permissionNameUtils } from '@/shared/utils/permissionNameUtils';
import { SettingsSlotId } from '../../constants/moduleSlots';
import { ALLOW_FLAG } from '../../constants/permissionSentinels';
import type { IPermissionRow } from '../../types';
import { conditionTypeUtils } from '../../utils/conditionTypeUtils';
import {
    type IPermissionAccountRef,
    type IPermissionEntity,
    permissionEntityUtils,
} from '../../utils/permissionEntityUtils';
import { NoConditionSlot } from '../noConditionSlot';

type DaoPlugins = IFilterComponentPlugin<IDaoPlugin>[] | undefined;

export interface IPermissionsListProps {
    /**
     * Permission rows to render.
     */
    rows: IPermissionRow[];
    /**
     * Account references used to resolve `who` / `where` entities.
     */
    accountRefs: IPermissionAccountRef[];
    /**
     * Installed DAO plugins used to classify plugin entities.
     */
    daoPlugins?: DaoPlugins;
    /**
     * Chain id for block-explorer links.
     */
    chainId?: number;
    /**
     * Whether the permissions are still loading.
     */
    isLoading: boolean;
    /**
     * Row keys currently expanded.
     */
    expandedRows: string[];
    /**
     * Called when the set of expanded rows changes.
     */
    onExpandedRowsChange: (rows: string[]) => void;
}

const SKELETON_ROW_KEYS = [
    'skeleton-1',
    'skeleton-2',
    'skeleton-3',
    'skeleton-4',
];

export const getPermissionRowKey = (row: IPermissionRow): string =>
    `${row.permissionId}-${row.whoAddress}-${row.whereAddress}`;

/**
 * Body of the permissions list view. Receives already-resolved data from the
 * shared `usePermissionsData` hook; the account selector, view toggle and
 * expand-all control live in the page shell so the list and graph share them.
 */
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
                        row={row}
                        rowKey={getPermissionRowKey(row)}
                    />
                ))}
            </Accordion.Container>
        </div>
    );
};

interface IPermissionsListRowProps {
    row: IPermissionRow;
    rowKey: string;
    daoPlugins: DaoPlugins;
    accounts: IPermissionAccountRef[];
    chainId?: number;
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
        {entity.type === 'plugin' && entity.tag != null && (
            <Tag
                className="max-w-[140px] shrink-0 [&>p]:truncate"
                label={entity.tag}
                variant="primary"
            />
        )}
        {entity.type === 'sentinel' && (
            <span
                aria-hidden="true"
                className="size-6 shrink-0 rounded-full bg-neutral-100"
            />
        )}
    </span>
);

interface IPermissionEntityDetailProps {
    entity: IPermissionEntity;
    chainId?: number;
}

const PermissionEntityDetail: React.FC<IPermissionEntityDetailProps> = ({
    entity,
    chainId,
}) => {
    const { buildEntityUrl } = useBlockExplorer({ chainId });

    if (entity.isSentinel) {
        return (
            <div className="flex flex-col gap-0.5">
                <span className="text-neutral-500">{entity.label}</span>
                <span className="font-mono text-neutral-400 text-sm">
                    {addressUtils.truncateAddress(entity.address)}
                </span>
            </div>
        );
    }

    const explorerUrl = buildEntityUrl({
        type: ChainEntityType.ADDRESS,
        id: entity.address,
    });

    return (
        <div className="flex flex-col gap-0.5">
            <Link
                className="w-fit"
                href={explorerUrl}
                isExternal={explorerUrl != null}
            >
                {addressUtils.truncateAddress(entity.address)}
            </Link>
            {entity.detailName != null && (
                <span className="text-neutral-500 text-sm">
                    {entity.detailName}
                </span>
            )}
        </div>
    );
};

interface IPermissionDetailValueProps {
    primary: string;
    secondary?: string;
}

const PermissionDetailValue: React.FC<IPermissionDetailValueProps> = ({
    primary,
    secondary,
}) => (
    <div className="flex flex-col gap-0.5">
        <span className="text-neutral-500">{primary}</span>
        {secondary != null && (
            <span className="font-mono text-neutral-400 text-sm">
                {secondary}
            </span>
        )}
    </div>
);

const PermissionsListRow: React.FC<IPermissionsListRowProps> = (props) => {
    const { row, rowKey, daoPlugins, accounts, chainId } = props;

    const { t } = useTranslations();

    const resolveOptions = { daoPlugins, accounts };
    const who = permissionEntityUtils.resolvePermissionEntity(
        row.whoAddress,
        resolveOptions,
    );
    const where = permissionEntityUtils.resolvePermissionEntity(
        row.whereAddress,
        resolveOptions,
    );
    const permissionName = permissionNameUtils.getPermissionName(
        row.permissionId,
    );
    const conditionType = conditionTypeUtils.resolveConditionType(
        row.conditionAddress,
        row.condition,
    );
    const conditionLabel = conditionTypeUtils.getConditionLabel(conditionType);

    const hasCondition = !addressUtils.isAddressEqual(
        row.conditionAddress,
        ALLOW_FLAG,
    );
    const conditionDetail = hasCondition
        ? addressUtils.truncateAddress(row.conditionAddress)
        : t('app.settings.permissionsList.details.noCondition');

    return (
        <Accordion.Item value={rowKey}>
            <Accordion.ItemHeader>
                <div className="grid w-full grid-cols-4 items-center gap-4 text-left">
                    <PermissionEntityCell entity={who} />
                    <PermissionEntityCell entity={where} />
                    <span className="truncate font-mono text-neutral-800">
                        {permissionName}
                    </span>
                    <span className="flex min-w-0">
                        {hasCondition ? (
                            <Tag label={conditionLabel} />
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
                            <DefinitionList.Item
                                copyValue={who.address}
                                term={t(
                                    'app.settings.permissionsList.details.who',
                                )}
                            >
                                <PermissionEntityDetail
                                    chainId={chainId}
                                    entity={who}
                                />
                            </DefinitionList.Item>
                            <DefinitionList.Item
                                copyValue={where.address}
                                term={t(
                                    'app.settings.permissionsList.details.where',
                                )}
                            >
                                <PermissionEntityDetail
                                    chainId={chainId}
                                    entity={where}
                                />
                            </DefinitionList.Item>
                            <DefinitionList.Item
                                copyValue={row.permissionId}
                                term={t(
                                    'app.settings.permissionsList.details.permission',
                                )}
                            >
                                <PermissionDetailValue
                                    primary={permissionName}
                                    secondary={addressUtils.truncateHash(
                                        row.permissionId,
                                    )}
                                />
                            </DefinitionList.Item>
                            <DefinitionList.Item
                                copyValue={
                                    hasCondition
                                        ? row.conditionAddress
                                        : undefined
                                }
                                term={t(
                                    'app.settings.permissionsList.details.condition',
                                )}
                            >
                                <PermissionDetailValue
                                    primary={conditionLabel}
                                    secondary={conditionDetail}
                                />
                            </DefinitionList.Item>
                        </DefinitionList.Container>
                    </div>
                    <div className="flex flex-1 flex-col gap-3">
                        <p className="text-lg text-neutral-800 leading-tight">
                            {t(
                                'app.settings.permissionsList.condition.heading',
                            )}
                        </p>
                        <PluginSingleComponent
                            Fallback={NoConditionSlot}
                            pluginId={conditionType}
                            slotId={SettingsSlotId.PERMISSION_CONDITION}
                            {...row.condition}
                        />
                    </div>
                </div>
            </Accordion.ItemContent>
        </Accordion.Item>
    );
};

const PermissionsListHeader: React.FC = () => {
    const { t } = useTranslations();

    return (
        <div className="sticky top-[90px] z-20 -mx-4 md:-mx-6">
            <div className="flex items-baseline justify-between gap-x-4 bg-gradient-to-b from-90% from-neutral-50 to-transparent px-8 pt-1 pb-4 text-neutral-500 text-sm md:gap-x-6 md:px-12">
                <div className="grid w-full grid-cols-4 gap-4">
                    <span>{t('app.settings.permissionsList.header.who')}</span>
                    <span>
                        {t('app.settings.permissionsList.header.where')}
                    </span>
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
                className="grid grid-cols-4 gap-4 rounded-xl border border-neutral-100 p-4"
                key={rowKey}
            >
                <StateSkeletonBar width="70%" />
                <StateSkeletonBar width="70%" />
                <StateSkeletonBar width="70%" />
                <StateSkeletonBar width="40%" />
            </div>
        ))}
    </div>
);
