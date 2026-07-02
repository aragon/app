'use client';

import { Button, Toggle, ToggleGroup } from '@aragon/gov-ui-kit';
import { useState } from 'react';
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

    const [expandedRows, setExpandedRows] = useState<string[]>([]);

    const handleViewChange = (value?: string | string[]) => {
        if (typeof value === 'string' && value) {
            setView(value);
        }
    };

    const handleAccountChange = (value?: string | string[]) => {
        if (typeof value === 'string' && value) {
            setSelectedAccountId(value);
        }
    };

    const allExpanded = rows.length > 0 && expandedRows.length === rows.length;

    const handleToggleAll = () => {
        setExpandedRows(allExpanded ? [] : rows.map(getPermissionRowKey));
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
    const showExpandAll = isListView && !isLoading && rows.length > 0;

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
                                rows={rows}
                            />
                        ) : (
                            <PermissionsGraph
                                activeAccountId={activeAccountId}
                                dao={permissionsDao}
                                daoPlugins={daoPlugins}
                                isLoading={isLoading}
                                rows={rows}
                            />
                        )}
                    </div>
                </Page.Main>
            </Page.Content>
        </>
    );
};
