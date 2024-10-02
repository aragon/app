'use client';

import { DaoGovernanceInfo } from '@/modules/settings/components/daoGovernanceInfo';
import { DaoMembersInfo } from '@/modules/settings/components/daoMembersInfo';
import { useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Card } from '@aragon/ods';
import { DaoSettingsInfo } from '../../components/daoSettingsInfo';
import { DaoVersionInfo } from '../../components/daoVersionInfo';

export interface IDaoSettingsPageClientProps {
    /**
     * ID of the Dao
     */
    daoId: string;
}

export const DaoSettingsPageClient: React.FC<IDaoSettingsPageClientProps> = (props) => {
    const { daoId } = props;

    const { t } = useTranslations();

    const daoParams = { urlParams: { id: daoId } };
    const { data: dao } = useDao(daoParams);

    if (!dao) {
        return null;
    }

    // TODO: update settings page to support multi-plugin DAOs (APP-3699)
    const daoPlugin = dao.plugins[0];

    return (
        <>
            <Page.Main title={t('app.settings.daoSettingsPage.main.title')}>
                <Page.Section title={t('app.settings.daoSettingsPage.main.settingsInfoTitle')}>
                    <DaoSettingsInfo dao={dao} />
                </Page.Section>
                <Page.Section title={t('app.settings.daoSettingsPage.main.governanceInfoTitle')}>
                    <Card className="p-6">
                        <DaoGovernanceInfo daoId={daoId} plugin={daoPlugin} />
                    </Card>
                </Page.Section>
                <Page.Section title={t('app.settings.daoSettingsPage.main.membersInfoTitle')}>
                    <Card className="p-6">
                        <DaoMembersInfo daoId={daoId} plugin={daoPlugin} />
                    </Card>
                </Page.Section>
            </Page.Main>
            <Page.Aside>
                <Page.Section title={t('app.settings.daoSettingsPage.aside.versionInfoTitle')}>
                    <DaoVersionInfo dao={dao} />
                </Page.Section>
            </Page.Aside>
        </>
    );
};
