'use client';

import {
    Button,
    Icon,
    IconType,
    Switch,
    Toggle,
    ToggleGroup,
    Tooltip,
} from '@aragon/gov-ui-kit';
import { useMemo, useState } from 'react';
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

export interface IDaoPermissionsPageClientProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export const permissionsViewParam = 'permissionsview';
export const permissionsDaoParam = 'permissionsdao';
export const permissionsSubpluginsParam = 'permissionssubplugins';

enum PermissionsView {
    LIST = 'list',
    GRAPH = 'graph',
}

type PermissionRows = ReturnType<typeof usePermissionsData>['rows'];

const booleanParamValues = ['false', 'true'];
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

    const [showDaoPermissionsParam, setShowDaoPermissions] = useFilterUrlParam({
        name: permissionsDaoParam,
        fallbackValue: 'false',
        validValues: booleanParamValues,
        enableUrlUpdate: true,
    });

    const [showSubpluginPermissionsParam, setShowSubpluginPermissions] =
        useFilterUrlParam({
            name: permissionsSubpluginsParam,
            fallbackValue: 'false',
            validValues: booleanParamValues,
            enableUrlUpdate: true,
        });

    const [expandedRows, setExpandedRows] = useState<string[]>([]);

    const showDaoPermissions = showDaoPermissionsParam === 'true';
    const showSubpluginPermissions = showSubpluginPermissionsParam === 'true';

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

    const handleShowDaoPermissionsChange = (checked: boolean) => {
        setShowDaoPermissions(String(checked));
        setExpandedRows([]);
    };

    const handleShowSubpluginPermissionsChange = (checked: boolean) => {
        setShowSubpluginPermissions(String(checked));
        setExpandedRows([]);
    };

    const filteredRows = useMemo(
        () =>
            filterPermissionRows(rows, {
                activeAccountAddress: activeAccount?.daoAddress,
                daoPlugins,
                showDaoPermissions,
                showSubpluginPermissions,
            }),
        [
            activeAccount?.daoAddress,
            daoPlugins,
            rows,
            showDaoPermissions,
            showSubpluginPermissions,
        ],
    );

    const showDaoPermissionsToggleDisabled = useMemo(
        () =>
            arePermissionRowsEqual(
                filteredRows,
                filterPermissionRows(rows, {
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
            rows,
            showDaoPermissions,
            showSubpluginPermissions,
        ],
    );

    const showSubpluginPermissionsToggleDisabled = useMemo(
        () =>
            arePermissionRowsEqual(
                filteredRows,
                filterPermissionRows(rows, {
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
            rows,
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
                                {showExpandAll && (
                                    <Button
                                        onClick={handleToggleAll}
                                        responsiveSize={{ md: 'md' }}
                                        size="sm"
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
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-neutral-700 text-sm md:justify-end">
                                <div className="flex items-center gap-1">
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
                                    <Tooltip
                                        content={t(
                                            'app.settings.daoPermissionsPage.filters.showDaoPermissionsTooltip',
                                        )}
                                        triggerAsChild={true}
                                    >
                                        <span
                                            aria-label={`${t(
                                                'app.settings.daoPermissionsPage.filters.showDaoPermissionsTooltipLabel',
                                            )}: ${t('app.settings.daoPermissionsPage.filters.showDaoPermissionsTooltip')}`}
                                            className="inline-flex size-5 shrink-0 cursor-help items-center justify-center self-center text-neutral-400 leading-none"
                                            role="img"
                                        >
                                            <Icon
                                                icon={IconType.INFO}
                                                size="sm"
                                            />
                                        </span>
                                    </Tooltip>
                                </div>
                                <div className="flex items-center gap-1">
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
                                    <Tooltip
                                        content={t(
                                            'app.settings.daoPermissionsPage.filters.showSubpluginPermissionsTooltip',
                                        )}
                                        triggerAsChild={true}
                                    >
                                        <span
                                            aria-label={`${t(
                                                'app.settings.daoPermissionsPage.filters.showSubpluginPermissionsTooltipLabel',
                                            )}: ${t('app.settings.daoPermissionsPage.filters.showSubpluginPermissionsTooltip')}`}
                                            className="inline-flex size-5 shrink-0 cursor-help items-center justify-center self-center text-neutral-400 leading-none"
                                            role="img"
                                        >
                                            <Icon
                                                icon={IconType.INFO}
                                                size="sm"
                                            />
                                        </span>
                                    </Tooltip>
                                </div>
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
                                rows={filteredRows}
                            />
                        )}
                    </div>
                </Page.Main>
            </Page.Content>
        </>
    );
};
