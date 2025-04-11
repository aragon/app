'use client';

import { DaoGovernanceInfo } from '@/modules/settings/components/daoGovernanceInfo';
import { DaoMembersInfo } from '@/modules/settings/components/daoMembersInfo';
import { AdminSettingsPanel } from '@/plugins/adminPlugin/components/adminSettingsPanel';
import { type IDaoPlugin, useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
import { Button, Card, IconType } from '@aragon/gov-ui-kit';
import type { Hex } from 'viem';
import { useDialogContext } from '../../../../shared/components/dialogProvider';
import { useConnectedWalletGuard } from '../../../application/hooks/useConnectedWalletGuard';
import { CreateDaoDialogId } from '../../../createDao/constants/createDaoDialogId';
import type { ICreateProcessDetailsDialogParams } from '../../../createDao/dialogs/createProcessDetailsDialog';
import { GovernanceDialogId } from '../../../governance/constants/governanceDialogId';
import type { ISelectPluginDialogParams } from '../../../governance/dialogs/selectPluginDialog';
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
    const { open } = useDialogContext();

    const daoParams = { urlParams: { id: daoId } };
    const { data: dao } = useDao(daoParams);

    const hasSupportedPlugins = daoUtils.hasSupportedPlugins(dao);

    const { check: checkWalletConnected } = useConnectedWalletGuard();

    const handleSuccess = (selectedPlugin: IDaoPlugin) => {
        // Step 3: Open the create process dialog with the selected plugin
        console.log('selectedPlugin', selectedPlugin);
        const params: ICreateProcessDetailsDialogParams = { daoId, pluginAddress: selectedPlugin.address as Hex };
        open(CreateDaoDialogId.CREATE_PROCESS_DETAILS, { params });
    };

    const handlePluginSelected = (plugin: IDaoPlugin) => {
        // Step 2: Check the connection
        checkWalletConnected({
            onSuccess: () => handleSuccess(plugin),
        });
    };

    const handleAddGovernanceProcessClick = () => {
        // Step 1: Select a plugin (a process to use to create a new proposal to add new process)
        const params: ISelectPluginDialogParams = {
            daoId,
            // excludePluginIds: ['admin'],
            onPluginSelected: handlePluginSelected,
        };
        open(GovernanceDialogId.SELECT_PLUGIN, { params });
    };

    if (!dao) {
        return null;
    }

    return (
        <>
            <Page.Main title={t('app.settings.daoSettingsPage.main.title')}>
                <AdminSettingsPanel daoId={daoId} />
                <Page.MainSection title={t('app.settings.daoSettingsPage.main.settingsInfoTitle')}>
                    <DaoSettingsInfo dao={dao} />
                </Page.MainSection>
                {hasSupportedPlugins && (
                    <Page.MainSection title={t('app.settings.daoSettingsPage.main.governanceInfoTitle')}>
                        <Card className="p-6">
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={handleAddGovernanceProcessClick}
                                iconLeft={IconType.PLUS}
                            >
                                {t(`app.application.bannerDao.adminMember.action`)}
                            </Button>
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
