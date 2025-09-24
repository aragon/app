import { GovernanceDialogId } from '@/modules/governance/constants/governanceDialogId';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import type { ISelectPluginDialogParams } from '@/modules/governance/dialogs/selectPluginDialog';
import { usePermissionCheckGuard } from '@/modules/governance/hooks/usePermissionCheckGuard';
import { useDao, type IDaoPlugin } from '@/shared/api/daoService';
import { useDialogContext, type IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { DialogAlert, DialogAlertFooter, invariant } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import type { Hex } from 'viem';
import { uninstallProcessDialogUtils } from './uninstallProcessDialogUtils';

export interface IUninstallProcessDialogParams {
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * Plugin to be uninstalled.
     */
    plugin: IDaoPlugin;
}

export interface IUninstallProcessDialogProps extends IDialogComponentProps<IUninstallProcessDialogParams> {}

export const UninstallProcessDialog: React.FC<IUninstallProcessDialogProps> = (props) => {
    const { location } = props;
    invariant(location.params != null, 'UninstallProcessDialog: required parameters must be set.');

    const { daoId, plugin } = location.params;

    const { t } = useTranslations();
    const { open, close } = useDialogContext();

    const [selectedPlugin, setSelectedPlugin] = useState<IDaoPlugin>();

    const { data: dao } = useDao({ urlParams: { id: daoId } });
    const daoAddress = dao!.address as Hex;

    const handleGuardSuccess = (selectedPlugin: IDaoPlugin) => {
        const proposal = uninstallProcessDialogUtils.buildProposal(daoAddress, plugin.address as Hex);
        const params = { proposal, daoId, plugin: selectedPlugin };
        open(GovernanceDialogId.PUBLISH_PROPOSAL, { params });
    };

    const handlePluginSelected = (plugin: IDaoPlugin) => {
        setSelectedPlugin(plugin);
        createProposalGuard({ plugin, onSuccess: () => handleGuardSuccess(plugin) });
    };

    const handleSelectProcessClick = () => {
        const params: ISelectPluginDialogParams = {
            daoId,
            excludePluginIds: [plugin.interfaceType],
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
            <DialogAlert.Header title={t('app.settings.uninstallProcessDialog.title')} />
            <DialogAlert.Content>
                <div className="flex flex-col gap-y-4 text-neutral-500">
                    <p>{t('app.settings.uninstallProcessDialog.description.1')}</p>
                    <p>{t('app.settings.uninstallProcessDialog.description.2')}</p>
                </div>
            </DialogAlert.Content>
            <DialogAlertFooter
                actionButton={{
                    label: t('app.settings.uninstallProcessDialog.action.select'),
                    onClick: handleSelectProcessClick,
                }}
                cancelButton={{
                    label: t('app.settings.uninstallProcessDialog.action.cancel'),
                    onClick: () => close(),
                }}
            />
        </>
    );
};
