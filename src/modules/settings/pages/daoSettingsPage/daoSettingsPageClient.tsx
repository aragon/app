'use client';
import { DaoSettingsInfo } from '@/modules/governance/components/daoSettingsInfo';
import { DaoVersionInfo } from '@/modules/governance/components/daoVersionInfo';
import { useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface IDaoSettingsPageClientProps {
    /**
     * ID of the Dao
     */
    daoId: string;
}

export const DaoSettingsPageClient: React.FC<IDaoSettingsPageClientProps> = (props) => {
    const { daoId } = props;
    const { data: dao } = useDao({ urlParams: { id: daoId } });
    const { t } = useTranslations();
    if (!dao) {
        return null;
    }
    return (
        <>
            <Page.Main title={t('app.governance.daoSettingsPage.main.title')}>
                <Page.Section title={t('app.governance.daoSettingsInfo.title')}>
                    <DaoSettingsInfo dao={dao} />
                </Page.Section>
            </Page.Main>
            <Page.Aside>
                <Page.Section title={t('app.governance.daoVersionInfo.title')}>
                    <DaoVersionInfo dao={dao} />
                </Page.Section>
            </Page.Aside>
        </>
    );
};
