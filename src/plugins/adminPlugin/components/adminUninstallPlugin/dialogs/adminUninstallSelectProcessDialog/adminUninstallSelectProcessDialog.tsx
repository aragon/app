import { GovernanceDialog } from '@/modules/governance/constants/moduleDialogs';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { IPublishProposalDialogParams } from '@/modules/governance/dialogs/publishProposalDialog';
import type { ISelectPluginDialogParams } from '@/modules/governance/dialogs/selectPluginDialog';
import { usePermissionCheckGuard } from '@/modules/governance/hooks/usePermissionCheckGuard';
import { useDao, type IDaoPlugin } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { DialogAlert, DialogAlertFooter } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import type { Hex } from 'viem';
import { adminUninstallSelectProcessDialogUtils } from './adminUninstallSelectProcessDialogUtils';

export interface IAdminUninstallSelectProcessDialogProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * The admin plugin.
     */
    adminPlugin: IDaoPlugin;
    /**
     * Whether the dialog is open.
     */
    isOpen: boolean;
    /**
     * Callback to close the dialog.
     */
    onClose: () => void;
}

export const AdminUninstallSelectProcessDialog: React.FC<IAdminUninstallSelectProcessDialogProps> = (props) => {
    const { daoId, adminPlugin, isOpen, onClose } = props;
    const [selectedPlugin, setSelectedPlugin] = useState<IDaoPlugin>(adminPlugin);

    const { t } = useTranslations();
    const keyNamespace = 'app.plugins.admin.adminUninstallEntry.adminUninstallSelectProcessDialog';

    const { open } = useDialogContext();

    const { data: dao } = useDao({ urlParams: { id: daoId } });
    const { pluginSetupProcessor } = networkDefinitions[dao!.network].addresses;
    const daoAddress = dao!.address as Hex;

    const handleSuccess = () => {
        const params: IPublishProposalDialogParams = adminUninstallSelectProcessDialogUtils.buildProposalParams(
            selectedPlugin,
            pluginSetupProcessor,
            daoAddress,
            daoId,
        );
        open(GovernanceDialog.PUBLISH_PROPOSAL, { params });
    };

    const handlePluginSelected = (plugin: IDaoPlugin) => {
        createProposalGuard({ plugin, onSuccess: () => handleSuccess() });
        setSelectedPlugin(plugin);
    };

    const handleSelectProcessClick = () => {
        const params: ISelectPluginDialogParams = {
            daoId,
            filteredPluginIds: ['admin'],
            onPluginSelected: handlePluginSelected,
        };
        open(GovernanceDialog.SELECT_PLUGIN, { params });
        onClose();
    };

    const { check: createProposalGuard } = usePermissionCheckGuard({
        permissionNamespace: 'proposal',
        slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION,
        onSuccess: () => handleSuccess(),
        plugin: selectedPlugin,
        daoId,
    });

    return (
        <DialogAlert.Root open={isOpen} variant="critical" hiddenDescription={t(`${keyNamespace}.hiddenDescription`)}>
            <DialogAlert.Header title={t(`${keyNamespace}.title`)} />
            <DialogAlert.Content>
                <div className="flex flex-col gap-y-4">
                    <p>{t(`${keyNamespace}.descriptionFirstLine`)}</p>
                    <p>{t(`${keyNamespace}.descriptionSecondLine`)}</p>
                </div>
            </DialogAlert.Content>
            <DialogAlertFooter
                actionButton={{ label: t(`${keyNamespace}.action.select`), onClick: handleSelectProcessClick }}
                cancelButton={{ label: t(`${keyNamespace}.action.cancel`), onClick: onClose }}
            />
        </DialogAlert.Root>
    );
};
