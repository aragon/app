'use client';

import { GovernanceDialogId } from '@/modules/governance/constants/governanceDialogId';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import type { ISelectPluginDialogParams } from '@/modules/governance/dialogs/selectPluginDialog';
import { usePermissionCheckGuard } from '@/modules/governance/hooks/usePermissionCheckGuard';
import { AdminSettingsPanel } from '@/plugins/adminPlugin/components/adminSettingsPanel';
import { type IDaoPlugin, useDao } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { PluginType } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { Button, Card, IconType } from '@aragon/gov-ui-kit';
import { useRouter } from 'next/navigation';
import { CreateDaoDialogId } from '../../../createDao/constants/createDaoDialogId';
import type { ICreateProcessDetailsDialogParams } from '../../../createDao/dialogs/createProcessDetailsDialog';
import { DaoGovernanceInfo } from '../../components/daoGovernanceInfo';
import { DaoMembersInfo } from '../../components/daoMembersInfo';
import { DaoSettingsInfo } from '../../components/daoSettingsInfo';
import { DaoVersionInfo } from '../../components/daoVersionInfo';
import { UpdateDaoContracts } from '../../components/updateDaoContracts';

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
    const router = useRouter();

    const daoParams = { urlParams: { id: daoId } };
    const { data: dao } = useDao(daoParams);

    const hasSupportedPlugins = daoUtils.hasSupportedPlugins(dao);
    const processPlugins = useDaoPlugins({ daoId, type: PluginType.PROCESS })!;

    const { check: createProposalGuard } = usePermissionCheckGuard({
        permissionNamespace: 'proposal',
        slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION,
        plugin: processPlugins[0].meta,
        daoId,
    });

    const handlePermissionGuardSuccess = (plugin: IDaoPlugin) => {
        const daoUrl: __next_route_internal_types__.DynamicRoutes = daoUtils.getDaoUrl(
            dao,
            `create/${plugin.address}/process`,
        )!;
        router.push(daoUrl);
    };

    const handlePluginSelected = (plugin: IDaoPlugin) => {
        createProposalGuard({
            plugin,
            onSuccess: () => handlePermissionGuardSuccess(plugin),
            // on error, go back to the plugin selection
            onError: handleConfirmProcessCreation,
        });
    };

    const handleConfirmProcessCreation = () => {
        // Select a plugin (a process to use to create a new process). If there is only 1 plugin, skip selection step.
        if (processPlugins.length === 1) {
            handlePluginSelected(processPlugins[0].meta);
            return;
        }

        const params: ISelectPluginDialogParams = {
            daoId,
            onPluginSelected: handlePluginSelected,
            variant: 'process',
        };
        open(GovernanceDialogId.SELECT_PLUGIN, { params });
    };

    const handleAddGovernanceProcessClick = () => {
        const params: ICreateProcessDetailsDialogParams = { onActionClick: handleConfirmProcessCreation };
        open(CreateDaoDialogId.CREATE_PROCESS_DETAILS, { params });
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
                        <Card className="flex flex-col gap-4 p-6">
                            <DaoGovernanceInfo daoId={daoId} />
                            <Button
                                size="md"
                                variant="secondary"
                                className="self-start"
                                onClick={handleAddGovernanceProcessClick}
                                iconLeft={IconType.PLUS}
                            >
                                {t('app.settings.daoSettingsPage.main.governanceAction')}
                            </Button>
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
                    <UpdateDaoContracts daoId={dao.id} />
                </Page.AsideCard>
            </Page.Aside>
        </>
    );
};
