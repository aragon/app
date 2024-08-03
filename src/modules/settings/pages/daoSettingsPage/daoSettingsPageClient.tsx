'use client';

import { DaoGovernanceInfo } from '@/modules/governance/components/daoGovernanceInfo';
import { DaoMembersInfo } from '@/modules/governance/components/daoMembersInfo';
import { useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
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

    return (
        <>
            <Page.Main title={t('app.governance.daoSettingsPage.main.title')}>
                <Page.Section title={t('app.governance.daoSettingsPage.main.settingsInfoTitle')}>
                    <DaoSettingsInfo dao={dao} />
                </Page.Section>
                <Page.Section title={t('app.governance.daoSettingsPage.main.governanceInfoTitle')}>
                    <DaoGovernanceInfo daoId={daoId} />
                </Page.Section>
                <Page.Section title={t('app.governance.daoSettingsPage.main.membersInfoTitle')}>
                    <DaoMembersInfo daoId={daoId} />
                </Page.Section>
            </Page.Main>
            <Page.Aside>
                <Page.Section title={t('app.governance.daoSettingsPage.aside.versionInfoTitle')}>
                    <DaoVersionInfo dao={dao} />
                </Page.Section>
            </Page.Aside>
        </>
    );
};
