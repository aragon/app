'use client';
import { DaoSettingsInfo } from '@/modules/governance/components/daoSettingsInfo';
import { DaoVersionInfo } from '@/modules/governance/components/daoVersionInfo';
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
    const { t } = useTranslations();

    return (
        <>
            <Page.Main title={t('app.governance.daoSettingsPage.main.title')}>
                <Page.Section title={t('app.governance.daoSettingsPage.main.daoSettingsInfo.title')}>
                    <DaoSettingsInfo daoId={daoId} />
                </Page.Section>
            </Page.Main>
            <Page.Aside>
                <DaoVersionInfo daoId={daoId} />
            </Page.Aside>
        </>
    );
};
