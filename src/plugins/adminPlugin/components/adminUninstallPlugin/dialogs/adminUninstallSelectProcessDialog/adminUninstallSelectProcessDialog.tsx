import type { ICreateProposalFormData, IProposalActionData } from '@/modules/governance/components/createProposalForm';
import { GovernanceDialog } from '@/modules/governance/constants/moduleDialogs';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import type { IPublishProposalDialogParams } from '@/modules/governance/dialogs/publishProposalDialog';
import type { ISelectPluginDialogParams } from '@/modules/governance/dialogs/selectPluginDialog';
import { usePermissionCheckGuard } from '@/modules/governance/hooks/usePermissionCheckGuard';
import type { ICreateProposalStartDateForm } from '@/modules/governance/utils/createProposalUtils';
import { useDao, type IDaoPlugin } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { permissionTransactionUtils } from '@/shared/utils/permissionTransactionUtils';
import { DialogAlert, DialogAlertFooter } from '@aragon/gov-ui-kit';
import { useCallback, useState } from 'react';
import type { Hex } from 'viem';

export interface IAdminUninstallSelectProcessDialogProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * Metadata of the admin plugin.
     */
    adminMeta: IDaoPlugin;
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
    const { daoId, adminMeta, isOpen, onClose } = props;
    const [selectedPlugin, setSelectedPlugin] = useState<IDaoPlugin>(adminMeta);

    const { t } = useTranslations();
    const keyNamespace = 'app.plugins.admin.adminSettingsPanel.adminUninstallSelectProcessDialog';

    const { open } = useDialogContext();

    const { data: dao } = useDao({ urlParams: { id: daoId } });
    const { pluginSetupProcessor } = networkDefinitions[dao!.network].addresses;
    const daoAddress = dao!.address;

    const handlePermissionGuardSuccess = useCallback(
        (plugin: IDaoPlugin) => {
            const rawAction = permissionTransactionUtils.buildRevokePermissionTransaction({
                where: daoAddress as Hex,
                who: pluginSetupProcessor,
                what: 'ROOT_PERMISSION',
                to: daoAddress as Hex,
            });

            const revokeAction: IProposalActionData = {
                ...rawAction,
                from: daoAddress,
                type: 'function',
                inputData: null,
                daoId,
                meta: undefined,
            };

            const values: ICreateProposalFormData & ICreateProposalStartDateForm = {
                title: 'Remove all admins',
                summary:
                    'This proposal intends to remove all admin control of the DAO. The action will revoke their permission to execute transactions on behalf of the DAO. By passing the proposal, it signifies that this governance process is configured properly and is able to execute on behalf of the DAO now.',
                body: '',
                addActions: true,
                resources: [],
                actions: [revokeAction],
                startTimeMode: 'now',
            };

            const params: IPublishProposalDialogParams = {
                values,
                daoId,
                pluginAddress: plugin.address,
                prepareActions: {},
            };
            open(GovernanceDialog.PUBLISH_PROPOSAL, { params });
        },
        [daoAddress, daoId, open, pluginSetupProcessor],
    );

    const handlePluginSelected = (plugin: IDaoPlugin) => {
        createProposalGuard({ plugin, onSuccess: () => handlePermissionGuardSuccess(plugin) });
        setSelectedPlugin(plugin);
    };

    const params: ISelectPluginDialogParams = {
        daoId,
        filteredPluginIds: ['admin'],
        onPluginSelected: handlePluginSelected,
    };

    const handleSelectProcessClick = () => {
        open(GovernanceDialog.SELECT_PLUGIN, { params });
        onClose();
    };

    const { check: createProposalGuard } = usePermissionCheckGuard({
        permissionNamespace: 'proposal',
        slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION,
        onSuccess: () => handlePermissionGuardSuccess(selectedPlugin),
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
