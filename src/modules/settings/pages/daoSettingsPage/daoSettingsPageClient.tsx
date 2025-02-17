'use client';

import { DaoGovernanceInfo } from '@/modules/settings/components/daoGovernanceInfo';
import { DaoMembersInfo } from '@/modules/settings/components/daoMembersInfo';
import { useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
import { Card, IconType } from '@aragon/gov-ui-kit';
import { DaoSettingsInfo } from '../../components/daoSettingsInfo';
import { DaoVersionInfo } from '../../components/daoVersionInfo';
import { useMemberExists } from '@/modules/governance/api/governanceService';
import { useAccount } from 'wagmi';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { AdminGovernanceInfo } from '@/plugins/adminPlugin/components/adminGovernanceInfo';

export interface IDaoSettingsPageClientProps {
    /**
     * ID of the Dao
     */
    daoId: string;
}

export const DaoSettingsPageClient: React.FC<IDaoSettingsPageClientProps> = (props) => {
    const { daoId } = props;

    const { address: memberAddress } = useAccount();

    const { t } = useTranslations();

    const daoParams = { urlParams: { id: daoId } };
    const { data: dao } = useDao(daoParams);

    const adminPlugin = useDaoPlugins({ daoId, subdomain: 'admin' })?.[0];
    const pluginAddress = adminPlugin?.meta.address;

    const memberExistsParams = { memberAddress: memberAddress as string, pluginAddress: pluginAddress! };

    const { data: isAdminMember } = useMemberExists(
        { urlParams: memberExistsParams },
        { enabled: memberAddress != null && pluginAddress != null },
    );

    const hasSupportedPlugins = daoUtils.hasSupportedPlugins(dao);

    const displayAdminSettings =
        adminPlugin && isAdminMember && process.env.NEXT_PUBLIC_FEATURE_GOVERNANCE_DESIGNER === 'true';

    if (!dao) {
        return null;
    }

    return (
        <>
            <Page.Main title={t('app.settings.daoSettingsPage.main.title')}>
                {displayAdminSettings && (
                    <Page.Section
                        title={t('app.settings.daoSettingsPage.main.adminSettingsTitle')}
                        icon={IconType.WARNING}
                    >
                        <Card className="p-6">
                            <AdminGovernanceInfo />
                        </Card>
                    </Page.Section>
                )}
                <Page.Section title={t('app.settings.daoSettingsPage.main.settingsInfoTitle')}>
                    <DaoSettingsInfo dao={dao} />
                </Page.Section>
                {hasSupportedPlugins && (
                    <Page.Section title={t('app.settings.daoSettingsPage.main.governanceInfoTitle')}>
                        <Card className="p-6">
                            <DaoGovernanceInfo daoId={daoId} />
                        </Card>
                    </Page.Section>
                )}
                {hasSupportedPlugins && (
                    <Page.Section title={t('app.settings.daoSettingsPage.main.membersInfoTitle')}>
                        <Card className="p-6">
                            <DaoMembersInfo daoId={daoId} />
                        </Card>
                    </Page.Section>
                )}
            </Page.Main>
            <Page.Aside>
                <Page.Section title={t('app.settings.daoSettingsPage.aside.versionInfoTitle')}>
                    <DaoVersionInfo dao={dao} />
                </Page.Section>
            </Page.Aside>
        </>
    );
};
