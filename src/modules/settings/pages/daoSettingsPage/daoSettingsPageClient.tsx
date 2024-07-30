'use client';
import { DaoDefinitionList } from '@/modules/governance/components/daoDefinitionList/daoDefinitionList';
import { DaoVersionInfoDefinitionList } from '@/modules/governance/components/daoVersionInfoDefinitionList';
import { type IGetDaoParams } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface IDaoSettingsPageClientProps {
    /**
     * Initial parameters to use to fetch the DAO information.
     */
    initialParams: IGetDaoParams;
}

export const DaoSettingsPageClient: React.FC<IDaoSettingsPageClientProps> = (props) => {
    const { initialParams } = props;
    const { t } = useTranslations();

    return (
        <>
            <Page.Main title={t('app.governance.daoSettingsPage.main.title')}>
                <DaoDefinitionList initialParams={initialParams} />
            </Page.Main>
            <Page.Aside>
                <DaoVersionInfoDefinitionList initialParams={initialParams} />
            </Page.Aside>
        </>
    );
};
