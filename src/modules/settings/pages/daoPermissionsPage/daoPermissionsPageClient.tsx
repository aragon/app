'use client';

import { Toggle, ToggleGroup } from '@aragon/gov-ui-kit';
import { useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFilterUrlParam } from '@/shared/hooks/useFilterUrlParam';
import { daoUtils } from '@/shared/utils/daoUtils';
import { PermissionsGraph } from '../../components/permissionsGraph';
import { PermissionsList } from '../../components/permissionsList';

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

    const [view, setView] = useFilterUrlParam({
        name: permissionsViewParam,
        fallbackValue: PermissionsView.LIST,
        validValues: permissionsViews,
        enableUrlUpdate: true,
    });

    const handleViewChange = (value?: string | string[]) => {
        if (typeof value === 'string' && value) {
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
                    <div className="flex flex-col gap-6">
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
                                label={t(
                                    'app.settings.daoPermissionsPage.view.graph',
                                )}
                                value="graph"
                            />
                        </ToggleGroup>
                        {view === PermissionsView.LIST && (
                            <PermissionsList daoId={daoId} />
                        )}
                        {view === PermissionsView.GRAPH && (
                            <PermissionsGraph daoId={daoId} />
                        )}
                    </div>
                </Page.Main>
            </Page.Content>
        </>
    );
};
