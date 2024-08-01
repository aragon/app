'use client';
import { DaoGovernanceInfo } from '@/modules/governance/components/daoGovernanceInfo';
import { DaoMembersInfo } from '@/modules/governance/components/daoMembersInfo';
import { DaoSettingsInfo } from '@/modules/governance/components/daoSettingsInfo';
import { DaoVersionInfo } from '@/modules/governance/components/daoVersionInfo';
import { useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Card } from '@aragon/ods';

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
                <Page.Section title={t('app.governance.daoSettingsPage.main.daoSettingsInfo.title')}>
                    <DaoSettingsInfo dao={dao} />
                </Page.Section>
                <Page.Section title={t('app.governance.daoSettingsPage.main.governance.title')}>
                    <DaoGovernanceInfo daoId={daoId} />
                </Page.Section>
                <Page.Section title={t('app.governance.daoSettingsPage.main.members.title')}>
                    <Card className="p-6">
                        <DaoMembersInfo daoId={daoId} />
                    </Card>
                </Page.Section>
            </Page.Main>
            <Page.Aside>
                <DaoVersionInfo dao={dao} />
            </Page.Aside>
        </>
    );
};
