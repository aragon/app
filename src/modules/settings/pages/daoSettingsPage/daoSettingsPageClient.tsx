'use client';

import { GovernanceDialogId } from '@/modules/governance/constants/governanceDialogId';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import type { ISelectPluginDialogParams } from '@/modules/governance/dialogs/selectPluginDialog';
import { usePermissionCheckGuard } from '@/modules/governance/hooks/usePermissionCheckGuard';
import { type IDaoPlugin, useDao } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { Page } from '@/shared/components/page';
import { PluginTabComponent } from '@/shared/components/pluginTabComponent';
import { ProcessDataListItem } from '@/shared/components/processDataListItem';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { PluginType } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { versionComparatorUtils } from '@/shared/utils/versionComparatorUtils';
import { IconType } from '@aragon/gov-ui-kit';
import { useRouter } from 'next/navigation';
import { CreateDaoDialogId } from '../../../createDao/constants/createDaoDialogId';
import type { ICreateProcessDetailsDialogParams } from '../../../createDao/dialogs/createProcessDetailsDialog';
import { DaoSettingsInfo } from '../../components/daoSettingsInfo';
import { DaoVersionInfo } from '../../components/daoVersionInfo';
import { UpdateDaoContracts } from '../../components/updateDaoContracts';
import { SettingsSlotId } from '../../constants/moduleSlots';

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

    const processPlugins = useDaoPlugins({ daoId, type: PluginType.PROCESS })!;

    const { check: createProposalGuard } = usePermissionCheckGuard({
        permissionNamespace: 'proposal',
        slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION,
        plugin: processPlugins[0].meta,
        daoId,
    });

    const handlePermissionGuardSuccess = (plugin: IDaoPlugin) =>
        router.push(daoUtils.getDaoUrl(dao, `create/${plugin.address}/process`)!);

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

    const handleAddProcess = () => {
        const params: ICreateProcessDetailsDialogParams = { onActionClick: handleConfirmProcessCreation };
        open(CreateDaoDialogId.CREATE_PROCESS_DETAILS, { params });
    };

    const supportsAddProcess = versionComparatorUtils.isGreaterOrEqualTo(dao?.version, '1.4');
    const addProcessAction = {
        onClick: handleAddProcess,
        label: t('app.settings.daoSettingsPage.main.governanceAction'),
        iconLeft: IconType.PLUS,
    };

    if (!dao) {
        return null;
    }

    return (
        <>
            <Page.Main title={t('app.settings.daoSettingsPage.main.title')}>
                <PluginTabComponent plugins={processPlugins} slotId={SettingsSlotId.SETTINGS_PANEL} daoId={daoId} />
                <Page.MainSection title={t('app.settings.daoSettingsPage.main.settingsInfoTitle')}>
                    <DaoSettingsInfo dao={dao} />
                </Page.MainSection>
                <Page.MainSection
                    className="gap-3"
                    inset={false}
                    title={t('app.settings.daoSettingsPage.main.governanceInfoTitle')}
                    action={supportsAddProcess ? addProcessAction : undefined}
                >
                    {processPlugins.map((process) => (
                        <ProcessDataListItem key={process.meta.slug} process={process.meta} />
                    ))}
                </Page.MainSection>
            </Page.Main>
            <Page.Aside>
                <Page.AsideCard title={t('app.settings.daoSettingsPage.aside.versionInfoTitle')}>
                    <DaoVersionInfo dao={dao} />
                    <UpdateDaoContracts dao={dao} />
                </Page.AsideCard>
            </Page.Aside>
        </>
    );
};
