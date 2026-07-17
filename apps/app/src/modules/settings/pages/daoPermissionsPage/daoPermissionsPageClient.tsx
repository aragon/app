'use client';

import { Button, Switch, Toggle, ToggleGroup } from '@aragon/gov-ui-kit';
import { useEffect, useMemo, useState } from 'react';
import { useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFilterUrlParam } from '@/shared/hooks/useFilterUrlParam';
import { daoUtils } from '@/shared/utils/daoUtils';
import { PermissionsGraph } from '../../components/permissionsGraph';
import {
    getPermissionRowKey,
    PermissionsList,
} from '../../components/permissionsList';
import { usePermissionsData } from '../../hooks/usePermissionsData';
import { filterPermissionRows } from '../../utils/permissionRowFilters';
import {
    type DisplayGraphMode,
    filterRowsByMode,
    graphModes,
} from './daoPermissionsPageClientUtils';

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

type PermissionRows = ReturnType<typeof usePermissionsData>['rows'];

const permissionsViews = Object.values(PermissionsView);

const getPermissionRowsSignature = (rows: PermissionRows): string =>
    rows.map(getPermissionRowKey).sort().join('|');

const arePermissionRowsEqual = (
    a: PermissionRows,
    b: PermissionRows,
): boolean => getPermissionRowsSignature(a) === getPermissionRowsSignature(b);

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

    const [mode, setMode] = useState<DisplayGraphMode>('incoming');
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
        if (graphModes.includes(value as DisplayGraphMode)) {
            setMode(value as DisplayGraphMode);
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

    const modeRowsByMode = useMemo<Record<DisplayGraphMode, PermissionRows>>(
        () => ({
            incoming: filterRowsByMode(
                rows,
                'incoming',
                activeAccount?.daoAddress,
            ),
            other: filterRowsByMode(rows, 'other', activeAccount?.daoAddress),
        }),
        [rows, activeAccount?.daoAddress],
    );

    const modeRows = modeRowsByMode[mode];

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

    const showDaoPermissionsToggleDisabled = useMemo(
        () =>
            arePermissionRowsEqual(
                filteredRows,
                filterPermissionRows(modeRows, {
                    activeAccountAddress: activeAccount?.daoAddress,
                    daoPlugins,
                    showDaoPermissions: !showDaoPermissions,
                    showSubpluginPermissions,
                }),
            ),
        [
            activeAccount?.daoAddress,
            daoPlugins,
            filteredRows,
            modeRows,
            showDaoPermissions,
            showSubpluginPermissions,
        ],
    );

    const showSubpluginPermissionsToggleDisabled = useMemo(
        () =>
            arePermissionRowsEqual(
                filteredRows,
                filterPermissionRows(modeRows, {
                    activeAccountAddress: activeAccount?.daoAddress,
                    daoPlugins,
                    showDaoPermissions,
                    showSubpluginPermissions: !showSubpluginPermissions,
                }),
            ),
        [
            activeAccount?.daoAddress,
            daoPlugins,
            filteredRows,
            modeRows,
            showDaoPermissions,
            showSubpluginPermissions,
        ],
    );

    useEffect(() => {
        if (isLoading || modeRowsByMode[mode].length > 0) {
            return;
        }

        const nextMode = graphModes.find(
            (graphMode) => modeRowsByMode[graphMode].length > 0,
        );

        if (nextMode != null) {
            setMode(nextMode);
            setExpandedRows([]);
        }
    }, [isLoading, mode, modeRowsByMode]);

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
                                        disabled={
                                            modeRowsByMode.incoming.length === 0
                                        }
                                        label={t(
                                            'app.settings.daoPermissionsPage.graphView.mode.incoming',
                                        )}
                                        value="incoming"
                                    />
                                    <Toggle
                                        disabled={
                                            modeRowsByMode.other.length === 0
                                        }
                                        label={t(
                                            'app.settings.daoPermissionsPage.graphView.mode.other',
                                        )}
                                        value="other"
                                    />
                                </ToggleGroup>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-neutral-700 text-sm">
                                    <Switch
                                        checked={showDaoPermissions}
                                        disabled={
                                            isLoading ||
                                            showDaoPermissionsToggleDisabled
                                        }
                                        inlineLabel={t(
                                            'app.settings.daoPermissionsPage.filters.showDaoPermissions',
                                        )}
                                        onCheckedChanged={
                                            handleShowDaoPermissionsChange
                                        }
                                    />
                                    <Switch
                                        checked={showSubpluginPermissions}
                                        disabled={
                                            isLoading ||
                                            showSubpluginPermissionsToggleDisabled
                                        }
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
