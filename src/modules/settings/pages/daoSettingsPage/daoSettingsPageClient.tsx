'use client';
import { DaoDefinitionList } from '@/modules/governance/components/daoDefinitionList/daoDefinitionList';
import { type IGetDaoParams, useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Heading } from '@aragon/ods';

export interface IDaoSettingsPageClientProps {
    /**
     * Initial parameters to use to fetch the DAO information.
     */
    initialParams: IGetDaoParams;
}

export const DaoSettingsPageClient: React.FC<IDaoSettingsPageClientProps> = (props) => {
    const { initialParams } = props;
    const { t } = useTranslations();

    const { data: dao } = useDao(initialParams);

    return (
        <>
            <Page.Main title={t('app.governance.daoSettingsPage.main.title')}>
                <Heading size="h3">DAO</Heading>
                <DaoDefinitionList dao={dao} />
            </Page.Main>
            <Page.Aside>
                <p>Aside</p>
            </Page.Aside>
        </>
    );
};
