import { GovernanceDialog } from '@/modules/governance/constants/moduleDialogs';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import type { IPublishProposalDialogParams } from '@/modules/governance/dialogs/publishProposalDialog';
import type { ISelectPluginDialogParams } from '@/modules/governance/dialogs/selectPluginDialog';
import { usePermissionCheckGuard } from '@/modules/governance/hooks/usePermissionCheckGuard';
import { useDao, type IDaoPlugin } from '@/shared/api/daoService';
import { useDialogContext, type IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { DialogAlert, DialogAlertFooter, invariant, type IDialogRootProps } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import type { Hex } from 'viem';
import { adminUninstallProcessDialogSelectUtils } from './adminUninstallProcessDialogSelectUtils';

export interface IAdminUninstallProcessDialogSelectParams extends IDialogRootProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * The admin plugin.
     */
    adminPlugin: IDaoPlugin;
}

export interface IAdminUninstallProcessDialogSelectProps
    extends IDialogComponentProps<IAdminUninstallProcessDialogSelectParams> {}

export const AdminUninstallProcessDialogSelect: React.FC<IAdminUninstallProcessDialogSelectProps> = (props) => {
    const { location } = props;
    invariant(location.params != null, 'AdminUninstallProcessDialogSelect: required parameters must be set.');

    const { daoId, adminPlugin } = location.params;
    const [selectedPlugin, setSelectedPlugin] = useState<IDaoPlugin>(adminPlugin);

    const { t } = useTranslations();

    const { open, close } = useDialogContext();

    const { data: dao } = useDao({ urlParams: { id: daoId } });
    const daoAddress = dao!.address as Hex;

    const handleSuccess = (selectedPlugin: IDaoPlugin) => {
        const params: IPublishProposalDialogParams = adminUninstallProcessDialogSelectUtils.buildProposalParams(
            daoAddress,
            adminPlugin.address as Hex,
            selectedPlugin.address as Hex,
            daoId,
        );
        open(GovernanceDialog.PUBLISH_PROPOSAL, { params });
    };

    const handlePluginSelected = (plugin: IDaoPlugin) => {
        setSelectedPlugin(plugin);
        createProposalGuard({ plugin, onSuccess: () => handleSuccess(plugin) });
    };

    const handleSelectProcessClick = () => {
        const params: ISelectPluginDialogParams = {
            daoId,
            excludePluginIds: ['admin'],
            onPluginSelected: handlePluginSelected,
        };
        open(GovernanceDialog.SELECT_PLUGIN, { params });
    };

    const { check: createProposalGuard } = usePermissionCheckGuard({
        permissionNamespace: 'proposal',
        slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION,
        plugin: selectedPlugin,
        daoId,
    });

    const handleClose = () => {
        close();
    };

    return (
        <>
            <DialogAlert.Header
                title={t('app.plugins.admin.adminUninstallPlugin.adminUninstallProcessDialogSelect.title')}
            />
            <DialogAlert.Content>
                <div className="flex flex-col gap-y-4">
                    <p className="text-neutral-500">
                        {t(
                            'app.plugins.admin.adminUninstallPlugin.adminUninstallProcessDialogSelect.descriptionFirstLine',
                        )}
                    </p>
                    <p className="text-neutral-500">
                        {t(
                            'app.plugins.admin.adminUninstallPlugin.adminUninstallProcessDialogSelect.descriptionSecondLine',
                        )}
                    </p>
                </div>
            </DialogAlert.Content>
            <DialogAlertFooter
                actionButton={{
                    label: t('app.plugins.admin.adminUninstallPlugin.adminUninstallProcessDialogSelect.action.select'),
                    onClick: handleSelectProcessClick,
                }}
                cancelButton={{
                    label: t('app.plugins.admin.adminUninstallPlugin.adminUninstallProcessDialogSelect.action.cancel'),
                    onClick: handleClose,
                }}
            />
        </>
    );
};
