import { GovernanceDialogId } from '@/modules/governance/constants/governanceDialogId';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import type { ISelectPluginDialogParams } from '@/modules/governance/dialogs/selectPluginDialog';
import { usePermissionCheckGuard } from '@/modules/governance/hooks/usePermissionCheckGuard';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { useDialogContext, type IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
import { DialogAlert, DialogAlertFooter, invariant } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import { SettingsDialogId } from '../../constants/settingsDialogId';
import type { IPreparePluginUninstallationDialogParams } from '../preparePluginUninstallationDialog';

export interface IUninstallPluginAlertDialogParams {
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * Plugin to be uninstalled.
     */
    uninstallPlugin: IDaoPlugin;
}

export interface IUninstallPluginAlertDialogProps extends IDialogComponentProps<IUninstallPluginAlertDialogParams> {}

export const UninstallPluginAlertDialog: React.FC<IUninstallPluginAlertDialogProps> = (props) => {
    const { location } = props;
    invariant(location.params != null, 'UninstallPluginAlertDialog: required parameters must be set.');

    const { daoId, uninstallPlugin } = location.params;

    const { t } = useTranslations();
    const { open, close } = useDialogContext();

    const [selectedPlugin, setSelectedPlugin] = useState<IDaoPlugin>();

    const handleGuardSuccess = (proposalPlugin: IDaoPlugin) => {
        const params: IPreparePluginUninstallationDialogParams = { daoId, uninstallPlugin, proposalPlugin };
        open(SettingsDialogId.PREPARE_PLUGIN_UNINSTALLATION, { params });
    };

    const handlePluginSelected = (proposalPlugin: IDaoPlugin) => {
        setSelectedPlugin(proposalPlugin);
        createProposalGuard({ plugin: proposalPlugin, onSuccess: () => handleGuardSuccess(proposalPlugin) });
    };

    const handleSelectPluginClick = () => {
        const params: ISelectPluginDialogParams = {
            daoId,
            excludePluginIds: [uninstallPlugin.slug],
            onPluginSelected: handlePluginSelected,
            fullExecuteOnly: true,
        };
        open(GovernanceDialogId.SELECT_PLUGIN, { params });
    };

    const { check: createProposalGuard } = usePermissionCheckGuard({
        permissionNamespace: 'proposal',
        slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION,
        plugin: selectedPlugin,
        daoId,
    });

    return (
        <>
            <DialogAlert.Header
                title={t('app.settings.uninstallPluginAlertDialog.title', {
                    name: daoUtils.getPluginName(uninstallPlugin),
                    slug: uninstallPlugin.slug,
                })}
            />
            <DialogAlert.Content>
                <div className="flex flex-col gap-y-4 pb-4 text-base leading-normal font-normal text-neutral-500">
                    <p>{t('app.settings.uninstallPluginAlertDialog.description.1')}</p>
                    <p>{t('app.settings.uninstallPluginAlertDialog.description.2')}</p>
                </div>
            </DialogAlert.Content>
            <DialogAlertFooter
                actionButton={{
                    label: t('app.settings.uninstallPluginAlertDialog.action.select'),
                    onClick: handleSelectPluginClick,
                }}
                cancelButton={{
                    label: t('app.settings.uninstallPluginAlertDialog.action.cancel'),
                    onClick: () => close(),
                }}
            />
        </>
    );
};
