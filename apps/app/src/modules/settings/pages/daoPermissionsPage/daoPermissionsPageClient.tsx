'use client';

import { Button, Switch, Toggle, ToggleGroup } from '@aragon/gov-ui-kit';
import { useMemo, useState } from 'react';
import { useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFilterUrlParam } from '@/shared/hooks/useFilterUrlParam';
import { daoUtils } from '@/shared/utils/daoUtils';
import {
    type GraphMode,
    PermissionsGraph,
} from '../../components/permissionsGraph';
import {
    getPermissionRowKey,
    PermissionsList,
} from '../../components/permissionsList';
import { usePermissionsData } from '../../hooks/usePermissionsData';
import { filterPermissionRows } from '../../utils/permissionRowFilters';

export interface IDaoPermissionsPageClientProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export const permissionsViewParam = 'permissionsview';

enum PermissionsView {
    LIST = 'list',
    GRAPH = 'graph',
}

const permissionsViews = Object.values(PermissionsView);

const graphModes: GraphMode[] = ['incoming', 'other'];

const filterRowsByMode = (
    rows: ReturnType<typeof usePermissionsData>['rows'],
    mode: GraphMode,
    activeAccountAddress?: string,
) => {
    const activeAddress = activeAccountAddress?.toLowerCase();

    if (activeAddress == null) {
        return rows;
    }

    return rows.filter((row) => {
        const whoAddress = row.whoAddress.toLowerCase();
        const whereAddress = row.whereAddress.toLowerCase();

        if (mode === 'incoming') {
            return whereAddress === activeAddress;
        }

        if (mode === 'outgoing') {
            return whoAddress === activeAddress;
        }

        return whoAddress !== activeAddress && whereAddress !== activeAddress;
    });
};

export const DaoPermissionsPageClient: React.FC<
    IDaoPermissionsPageClientProps
> = (props) => {
    const { daoId } = props;

    const { t } = useTranslations();

    const { data: dao } = useDao({ urlParams: { id: daoId } });

    const {
        dao: permissionsDao,
        accounts,
        activeAccountId,
        activeAccount,
        setSelectedAccountId,
        accountRefs,
        daoPlugins,
        rows,
        chainId,
        isLoading,
    } = usePermissionsData({ daoId });

    const [view, setView] = useFilterUrlParam({
        name: permissionsViewParam,
        fallbackValue: PermissionsView.LIST,
        validValues: permissionsViews,
        enableUrlUpdate: true,
    });

    const [mode, setMode] = useState<GraphMode>('incoming');
    const [showDaoPermissions, setShowDaoPermissions] = useState(false);
    const [showSubpluginPermissions, setShowSubpluginPermissions] =
        useState(false);
    const [expandedRows, setExpandedRows] = useState<string[]>([]);

    const handleViewChange = (value?: string | string[]) => {
        if (typeof value === 'string' && value) {
            setView(value);
        }
    };

    const handleAccountChange = (value?: string | string[]) => {
        if (typeof value === 'string' && value) {
            setSelectedAccountId(value);
            setExpandedRows([]);
        }
    };

    const handleModeChange = (value?: string | string[]) => {
        if (graphModes.includes(value as GraphMode)) {
            setMode(value as GraphMode);
            setExpandedRows([]);
        }
    };

    const handleShowDaoPermissionsChange = (checked: boolean) => {
        setShowDaoPermissions(checked);
        setExpandedRows([]);
    };

    const handleShowSubpluginPermissionsChange = (checked: boolean) => {
        setShowSubpluginPermissions(checked);
        setExpandedRows([]);
    };

    const modeRows = useMemo(
        () => filterRowsByMode(rows, mode, activeAccount?.daoAddress),
        [rows, mode, activeAccount?.daoAddress],
    );

    const filteredRows = useMemo(
        () =>
            filterPermissionRows(modeRows, {
                activeAccountAddress: activeAccount?.daoAddress,
                daoPlugins,
                showDaoPermissions,
                showSubpluginPermissions,
            }),
        [
            activeAccount?.daoAddress,
            daoPlugins,
            modeRows,
            showDaoPermissions,
            showSubpluginPermissions,
        ],
    );

    const allExpanded =
        filteredRows.length > 0 && expandedRows.length === filteredRows.length;

    const handleToggleAll = () => {
        setExpandedRows(
            allExpanded ? [] : filteredRows.map(getPermissionRowKey),
        );
    };

    const pageBreadcrumbs = [
        {
            href: daoUtils.getDaoUrl(dao, 'settings'),
            label: t(
                'app.settings.daoPermissionsPage.header.breadcrumb.settings',
            ),
        },
        {
            label: t(
                'app.settings.daoPermissionsPage.header.breadcrumb.permissions',
            ),
        },
    ];

    const isListView = view === PermissionsView.LIST;
    const showAccountSelector = accounts.length > 1;
    const showExpandAll = isListView && !isLoading && filteredRows.length > 0;

    return (
        <>
            <Page.Header
                breadcrumbs={pageBreadcrumbs}
                description={t(
                    'app.settings.daoPermissionsPage.header.description',
                )}
                title={t('app.settings.daoPermissionsPage.header.title')}
            />
            <Page.Content>
                <Page.Main>
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex flex-wrap items-center gap-3">
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
                                <ToggleGroup
                                    isMultiSelect={false}
                                    onChange={handleModeChange}
                                    value={mode}
                                >
                                    <Toggle
                                        label={t(
                                            'app.settings.daoPermissionsPage.graphView.mode.incoming',
                                        )}
                                        value="incoming"
                                    />
                                    <Toggle
                                        label={t(
                                            'app.settings.daoPermissionsPage.graphView.mode.other',
                                        )}
                                        value="other"
                                    />
                                </ToggleGroup>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-neutral-700 text-sm">
                                    <Switch
                                        checked={showDaoPermissions}
                                        inlineLabel={t(
                                            'app.settings.daoPermissionsPage.filters.showDaoPermissions',
                                        )}
                                        onCheckedChanged={
                                            handleShowDaoPermissionsChange
                                        }
                                    />
                                    <Switch
                                        checked={showSubpluginPermissions}
                                        inlineLabel={t(
                                            'app.settings.daoPermissionsPage.filters.showSubpluginPermissions',
                                        )}
                                        onCheckedChanged={
                                            handleShowSubpluginPermissionsChange
                                        }
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-3 md:ml-auto md:gap-6">
                                {showExpandAll && (
                                    <Button
                                        onClick={handleToggleAll}
                                        size="md"
                                        variant="tertiary"
                                    >
                                        {allExpanded
                                            ? t(
                                                  'app.settings.permissionsList.collapseAll',
                                              )
                                            : t(
                                                  'app.settings.permissionsList.expandAll',
                                              )}
                                    </Button>
                                )}
                                <ToggleGroup
                                    isMultiSelect={false}
                                    onChange={handleViewChange}
                                    value={view}
                                >
                                    <Toggle
                                        label={t(
                                            'app.settings.daoPermissionsPage.view.list',
                                        )}
                                        value={PermissionsView.LIST}
                                    />
                                    <Toggle
                                        label={t(
                                            'app.settings.daoPermissionsPage.view.graph',
                                        )}
                                        value={PermissionsView.GRAPH}
                                    />
                                </ToggleGroup>
                            </div>
                        </div>
                        {isListView ? (
                            <PermissionsList
                                accountRefs={accountRefs}
                                chainId={chainId}
                                daoPlugins={daoPlugins}
                                expandedRows={expandedRows}
                                isLoading={isLoading}
                                onExpandedRowsChange={setExpandedRows}
                                rows={filteredRows}
                            />
                        ) : (
                            <PermissionsGraph
                                accountRefs={accountRefs}
                                activeAccountAddress={activeAccount?.daoAddress}
                                dao={permissionsDao}
                                daoPlugins={daoPlugins}
                                isLoading={isLoading}
                                mode={mode}
                                rows={filteredRows}
                            />
                        )}
                    </div>
                </Page.Main>
            </Page.Content>
        </>
    );
};
