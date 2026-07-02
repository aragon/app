'use client';

import { Toggle, ToggleGroup } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import { useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
import { PermissionsList } from '../../components/permissionsList';

export interface IDaoPermissionsPageClientProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
}

type PermissionsView = 'list' | 'graph';

export const DaoPermissionsPageClient: React.FC<
    IDaoPermissionsPageClientProps
> = (props) => {
    const { daoId } = props;

    const { t } = useTranslations();

    const { data: dao } = useDao({ urlParams: { id: daoId } });

    // Graph view is out of scope for now (T05 shell); only the list view is wired up.
    const [view, setView] = useState<PermissionsView>('list');

    const handleViewChange = (value: string | string[] | undefined) => {
        if (value === 'list' || value === 'graph') {
            setView(value);
        }
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
                    {view === 'list' && (
                        <PermissionsList
                            daoId={daoId}
                            viewSwitcher={
                                <ToggleGroup
                                    isMultiSelect={false}
                                    onChange={handleViewChange}
                                    value={view}
                                >
                                    <Toggle
                                        label={t(
                                            'app.settings.daoPermissionsPage.view.list',
                                        )}
                                        value="list"
                                    />
                                    <Toggle
                                        disabled={true}
                                        label={t(
                                            'app.settings.daoPermissionsPage.view.graph',
                                        )}
                                        value="graph"
                                    />
                                </ToggleGroup>
                            }
                        />
                    )}
                </Page.Main>
            </Page.Content>
        </>
    );
};
