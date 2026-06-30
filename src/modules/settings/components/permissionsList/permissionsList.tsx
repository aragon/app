'use client';

import {
    Accordion,
    Button,
    CardEmptyState,
    StateSkeletonBar,
    Tabs,
} from '@aragon/gov-ui-kit';
import { useMemo, useState } from 'react';
import {
    type Network,
    useAllDaoPermissions,
    useDao,
} from '@/shared/api/daoService';
import { useFeatureFlags } from '@/shared/components/featureFlagsProvider';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { permissionNameUtils } from '@/shared/utils/permissionNameUtils';
import { SettingsSlotId } from '../../constants/moduleSlots';
import type { IPermissionRow } from '../../types';
import { conditionTypeUtils } from '../../utils/conditionTypeUtils';
import { permissionEntityUtils } from '../../utils/permissionEntityUtils';
import { NoConditionSlot } from '../noConditionSlot';

export interface IPermissionsListProps {
    /**
     * ID of the DAO to display permissions for.
     */
    daoId: string;
}

interface IPermissionsAccount {
    id: string;
    name: string;
    network: Network;
    daoAddress: string;
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
    const { daoId } = props;

    const { t } = useTranslations();
    const { isEnabled } = useFeatureFlags();

    const { data: dao } = useDao({ urlParams: { id: daoId } });
    const daoPlugins = useDaoPlugins({
        daoId,
        includeLinkedAccounts: true,
    });

    const accounts = useMemo<IPermissionsAccount[]>(() => {
        if (dao == null) {
            return [];
        }

        const mainAccount: IPermissionsAccount = {
            id: dao.id,
            name: dao.name,
            network: dao.network,
            daoAddress: dao.address,
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
            })),
        ];
    }, [dao, isEnabled]);

    const [selectedAccountId, setSelectedAccountId] = useState<string>();
    const activeAccountId = selectedAccountId ?? accounts[0]?.id;
    const activeAccount =
        accounts.find((account) => account.id === activeAccountId) ??
        accounts[0];

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
    const rows = (data ?? []) as IPermissionRow[];

    const [expandedRows, setExpandedRows] = useState<string[]>([]);
    const allExpanded = rows.length > 0 && expandedRows.length === rows.length;

    const handleToggleAll = () => {
        setExpandedRows(allExpanded ? [] : rows.map(getRowKey));
    };

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
                <div className="flex justify-end">
                    <Button
                        onClick={handleToggleAll}
                        size="sm"
                        variant="tertiary"
                    >
                        {allExpanded
                            ? t('app.settings.permissionsList.collapseAll')
                            : t('app.settings.permissionsList.expandAll')}
                    </Button>
                </div>
                <PermissionsListHeader />
                <Accordion.Container
                    isMulti={true}
                    onValueChange={(value) => setExpandedRows(value ?? [])}
                    value={expandedRows}
                >
                    {rows.map((row) => (
                        <PermissionsListRow
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

    if (accounts.length <= 1) {
        return renderBody();
    }

    return (
        <Tabs.Root onValueChange={setSelectedAccountId} value={activeAccountId}>
            <Tabs.List>
                {accounts.map((account) => (
                    <Tabs.Trigger
                        key={account.id}
                        label={account.name}
                        value={account.id}
                    />
                ))}
            </Tabs.List>
            {accounts.map((account) => (
                <Tabs.Content key={account.id} value={account.id}>
                    {renderBody()}
                </Tabs.Content>
            ))}
        </Tabs.Root>
    );
};

type DaoPlugins = ReturnType<typeof useDaoPlugins>;

interface IPermissionsListRowProps {
    row: IPermissionRow;
    rowKey: string;
    daoPlugins: DaoPlugins;
}

const PermissionsListRow: React.FC<IPermissionsListRowProps> = (props) => {
    const { row, rowKey, daoPlugins } = props;

    const who = permissionEntityUtils.resolvePermissionEntity(
        row.whoAddress,
        daoPlugins,
    );
    const where = permissionEntityUtils.resolvePermissionEntity(
        row.whereAddress,
        daoPlugins,
    );
    const permissionName = permissionNameUtils.getPermissionName(
        row.permissionId,
    );
    const conditionType = conditionTypeUtils.resolveConditionType(
        row.conditionAddress,
        row.condition,
    );

    return (
        <Accordion.Item value={rowKey}>
            <Accordion.ItemHeader>
                <div className="grid w-full grid-cols-3 gap-4 text-left">
                    <span className="truncate text-neutral-800">
                        {who.label}
                    </span>
                    <span className="truncate text-neutral-800">
                        {where.label}
                    </span>
                    <span className="truncate text-neutral-800">
                        {permissionName}
                    </span>
                </div>
            </Accordion.ItemHeader>
            <Accordion.ItemContent>
                <PluginSingleComponent
                    Fallback={NoConditionSlot}
                    pluginId={conditionType}
                    slotId={SettingsSlotId.PERMISSION_CONDITION}
                    {...row.condition}
                />
            </Accordion.ItemContent>
        </Accordion.Item>
    );
};

const PermissionsListHeader: React.FC = () => {
    const { t } = useTranslations();

    return (
        <div className="grid grid-cols-4 gap-4 px-4 text-neutral-500 text-sm">
            <span>{t('app.settings.permissionsList.header.who')}</span>
            <span>{t('app.settings.permissionsList.header.where')}</span>
            <span>{t('app.settings.permissionsList.header.permission')}</span>
            <span>{t('app.settings.permissionsList.header.condition')}</span>
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
