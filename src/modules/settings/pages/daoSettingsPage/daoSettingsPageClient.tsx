'use client';

import { DaoGovernanceInfo } from '@/modules/settings/components/daoGovernanceInfo';
import { DaoMembersInfo } from '@/modules/settings/components/daoMembersInfo';
import { AdminGovernanceInfo } from '@/plugins/adminPlugin/components/adminGovernanceInfo';
import { useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useAdminStatus } from '@/shared/hooks/useAdminStatus';
import { daoUtils } from '@/shared/utils/daoUtils';
import { Card, IconType } from '@aragon/gov-ui-kit';
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

    const { hasAdminPlugin } = useAdminStatus({ daoId });

    const daoParams = { urlParams: { id: daoId } };
    const { data: dao } = useDao(daoParams);

    const hasSupportedPlugins = daoUtils.hasSupportedPlugins(dao);

    if (!dao) {
        return null;
    }

    return (
        <>
            <Page.Main title={t('app.settings.daoSettingsPage.main.title')}>
                                {hasAdminPlugin && (
                    <Page.MainSection
                        title={t('app.settings.daoSettingsPage.main.adminSettingsTitle')}
                        icon={IconType.WARNING}
                    >
                        <Card className="p-6">
                            <AdminGovernanceInfo />
                        </Card>
                    </Page.MainSection>
                )}
                <Page.MainSection title={t('app.settings.daoSettingsPage.main.settingsInfoTitle')}>
                    <DaoSettingsInfo dao={dao} />
                </Page.MainSection>
                {hasSupportedPlugins && (
                    <Page.MainSection title={t('app.settings.daoSettingsPage.main.governanceInfoTitle')}>
                        <Card className="p-6">
                            <DaoGovernanceInfo daoId={daoId} />
                        </Card>
                    </Page.MainSection>
                )}
                {hasSupportedPlugins && (
                    <Page.MainSection title={t('app.settings.daoSettingsPage.main.membersInfoTitle')}>
                        <Card className="p-6">
                            <DaoMembersInfo daoId={daoId} />
                        </Card>
                    </Page.MainSection>
                )}
            </Page.Main>
            <Page.Aside>
                <Page.AsideCard title={t('app.settings.daoSettingsPage.aside.versionInfoTitle')}>
                    <DaoVersionInfo dao={dao} />
                </Page.AsideCard>
            </Page.Aside>
        </>
    );
};
