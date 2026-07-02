'use client';

import {
    Accordion,
    addressUtils,
    Button,
    CardEmptyState,
    ChainEntityType,
    DaoAvatar,
    DefinitionList,
    Link,
    StateSkeletonBar,
    Tag,
    Toggle,
    ToggleGroup,
    useBlockExplorer,
} from '@aragon/gov-ui-kit';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import {
    type Network,
    useAllDaoPermissions,
    useDao,
} from '@/shared/api/daoService';
import { useFeatureFlags } from '@/shared/components/featureFlagsProvider';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { permissionNameUtils } from '@/shared/utils/permissionNameUtils';
import { SettingsSlotId } from '../../constants/moduleSlots';
import { ALLOW_FLAG } from '../../constants/permissionSentinels';
import {
    permissionsPreviewAccounts,
    permissionsPreviewPlugins,
} from '../../constants/permissionsPreviewData';
import { PermissionsPreviewRef } from '../../constants/permissionsPreviewRefs';
import type { IPermissionRow } from '../../types';
import { conditionTypeUtils } from '../../utils/conditionTypeUtils';
import {
    type IPermissionAccountRef,
    type IPermissionEntity,
    permissionEntityUtils,
} from '../../utils/permissionEntityUtils';
import { NoConditionSlot } from '../noConditionSlot';

export interface IPermissionsListProps {
    /**
     * ID of the DAO to display permissions for.
     */
    daoId: string;
    /**
     * View switcher (list/graph toggle) rendered on the right of the filter row.
     */
    viewSwitcher?: ReactNode;
}

interface IPermissionsAccount {
    id: string;
    name: string;
    network: Network;
    daoAddress: string;
    avatarSrc?: string;
}

const SKELETON_ROW_KEYS = [
    'skeleton-1',
    'skeleton-2',
    'skeleton-3',
    'skeleton-4',
];

const getRowKey = (row: IPermissionRow): string =>
    `${row.permissionId}-${row.whoAddress}-${row.whereAddress}`;

export const PermissionsList: React.FC<IPermissionsListProps> = (props) => {
    const { daoId, viewSwitcher } = props;

    const { t } = useTranslations();
    const { isEnabled } = useFeatureFlags();

    // The `useMocks` flag drives both the preview permission rows and the
    // self-contained "Patito DAO" identity they resolve against.
    const isPreview = isEnabled('useMocks');

    const { data: dao } = useDao({ urlParams: { id: daoId } });
    const realDaoPlugins = useDaoPlugins({
        daoId,
        includeLinkedAccounts: true,
    });
    const daoPlugins = isPreview ? permissionsPreviewPlugins : realDaoPlugins;

    const realAccounts = useMemo<IPermissionsAccount[]>(() => {
        if (dao == null) {
            return [];
        }

        const mainAccount: IPermissionsAccount = {
            id: dao.id,
            name: dao.name,
            network: dao.network,
            daoAddress: dao.address,
            avatarSrc: ipfsUtils.cidToSrc(dao.avatar),
        };

        const linkedAccounts = dao.linkedAccounts ?? [];
        const showLinkedAccounts =
            isEnabled('linkedAccount') && linkedAccounts.length > 0;

        if (!showLinkedAccounts) {
            return [mainAccount];
        }

        return [
            mainAccount,
            ...linkedAccounts.map((account) => ({
                id: account.id,
                name: account.name,
                network: account.network,
                daoAddress: account.address,
                avatarSrc: ipfsUtils.cidToSrc(account.avatar),
            })),
        ];
    }, [dao, isEnabled]);

    const accounts = isPreview ? permissionsPreviewAccounts : realAccounts;

    const [selectedAccountId, setSelectedAccountId] = useState<string>();
    const activeAccountId = selectedAccountId ?? accounts[0]?.id;

    const handleAccountChange = (value: string | string[] | undefined) => {
        if (typeof value === 'string') {
            setSelectedAccountId(value);
        }
    };
    const activeAccount =
        accounts.find((account) => account.id === activeAccountId) ??
        accounts[0];

    const accountRefs = useMemo<IPermissionAccountRef[]>(
        () =>
            accounts.map((account) => ({
                address: account.daoAddress,
                name: account.name,
                avatarSrc: account.avatarSrc,
            })),
        [accounts],
    );

    const { data, isLoading } = useAllDaoPermissions(
        {
            urlParams: {
                network: activeAccount?.network as Network,
                daoAddress: activeAccount?.daoAddress ?? '',
            },
        },
        { enabled: activeAccount != null },
    );

    // NOTE: the optional `condition` field is supplied by the preview mock until
    // APP-953 formalizes it on the permissions response; cast at this boundary.
    const rows = useMemo(() => {
        const rawRows = (data ?? []) as IPermissionRow[];
        const pluginAddresses = (daoPlugins ?? []).map(
            (plugin) => plugin.meta.address,
        );

        const linkedAddress = accounts.find(
            (account) => account.id !== activeAccount?.id,
        )?.daoAddress;

        // Swap preview markers for the viewed DAO's real addresses so the sample
        // rows resolve to names/tags/avatars. No-op for real backend data.
        const refMap = new Map<string, string | undefined>([
            [
                PermissionsPreviewRef.self.toLowerCase(),
                activeAccount?.daoAddress,
            ],
            [PermissionsPreviewRef.linked.toLowerCase(), linkedAddress],
            [PermissionsPreviewRef.plugin0.toLowerCase(), pluginAddresses[0]],
            [PermissionsPreviewRef.plugin1.toLowerCase(), pluginAddresses[1]],
        ]);
        const resolveRef = (address: string): string =>
            refMap.get(address.toLowerCase()) ?? address;

        return rawRows.map((row) => ({
            ...row,
            whoAddress: resolveRef(row.whoAddress),
            whereAddress: resolveRef(row.whereAddress),
        }));
    }, [data, daoPlugins, activeAccount, accounts]);

    const [expandedRows, setExpandedRows] = useState<string[]>([]);
    const allExpanded = rows.length > 0 && expandedRows.length === rows.length;

    const handleToggleAll = () => {
        setExpandedRows(allExpanded ? [] : rows.map(getRowKey));
    };

    const chainId = activeAccount
        ? networkDefinitions[activeAccount.network].id
        : undefined;

    const renderBody = () => {
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
                    onValueChange={(value) => setExpandedRows(value ?? [])}
                    value={expandedRows}
                >
                    {rows.map((row) => (
                        <PermissionsListRow
                            accounts={accountRefs}
                            chainId={chainId}
                            daoPlugins={daoPlugins}
                            key={getRowKey(row)}
                            row={row}
                            rowKey={getRowKey(row)}
                        />
                    ))}
                </Accordion.Container>
            </div>
        );
    };

    const showAccountSelector = accounts.length > 1;
    const showExpandAll = !isLoading && rows.length > 0;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                {showAccountSelector && (
                    <ToggleGroup
                        isMultiSelect={false}
                        onChange={handleAccountChange}
                        value={activeAccountId}
                    >
                        {accounts.map((account) => (
                            <Toggle
                                key={account.id}
                                label={account.name}
                                value={account.id}
                            />
                        ))}
                    </ToggleGroup>
                )}
                <div className="flex items-center gap-3 md:ml-auto md:gap-6">
                    {showExpandAll && (
                        <Button
                            onClick={handleToggleAll}
                            size="md"
                            variant="tertiary"
                        >
                            {allExpanded
                                ? t('app.settings.permissionsList.collapseAll')
                                : t('app.settings.permissionsList.expandAll')}
                        </Button>
                    )}
                    {viewSwitcher}
                </div>
            </div>
            {renderBody()}
        </div>
    );
};

type DaoPlugins = ReturnType<typeof useDaoPlugins>;

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
