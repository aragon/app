import type { ICreateProposalFormData, IProposalActionData } from '@/modules/governance/components/createProposalForm';
import { GovernanceDialog } from '@/modules/governance/constants/moduleDialogs';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import type { IPublishProposalDialogParams } from '@/modules/governance/dialogs/publishProposalDialog';
import type { ISelectPluginDialogParams } from '@/modules/governance/dialogs/selectPluginDialog';
import { usePermissionCheckGuard } from '@/modules/governance/hooks/usePermissionCheckGuard';
import type { ICreateProposalStartDateForm } from '@/modules/governance/utils/createProposalUtils';
import { useDao, type IDaoPlugin } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { permissionTransactionUtils } from '@/shared/utils/permissionTransactionUtils';
import { DialogAlert, DialogAlertFooter } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import type { Hex } from 'viem';

export interface IUninstallSelectProcessDialogProps {
    daoId: string;
    adminMeta: IDaoPlugin;
    isOpen: boolean;
    onClose: () => void;
}

export const UninstallSelectProcessDialog: React.FC<IUninstallSelectProcessDialogProps> = (props) => {
    const { daoId, adminMeta, isOpen, onClose } = props;
    const [selectedPlugin, setSelectedPlugin] = useState<IDaoPlugin>(adminMeta);
    const { open } = useDialogContext();

    const { data: dao } = useDao({ urlParams: { id: daoId } });
    const { pluginSetupProcessor } = networkDefinitions[dao!.network].addresses;
    const daoAddress = dao!.address;

    const handlePermissionGuardSuccess = (plugin: IDaoPlugin) => {
        const params: IPublishProposalDialogParams = {
            values,
            daoId,
            pluginAddress: plugin.address,
            prepareActions: {},
        };
        open(GovernanceDialog.PUBLISH_PROPOSAL, { params });
    };

    const handlePluginSelected = (plugin: IDaoPlugin) => {
        createProposalGuard({ plugin, onSuccess: () => handlePermissionGuardSuccess(plugin) });
        setSelectedPlugin(plugin);
    };

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
        <DialogAlert.Root open={isOpen} variant="critical">
            <DialogAlert.Header title="Remove all admins" />
            <DialogAlert.Content>
                <div className="flex flex-col gap-y-4">
                    <p>
                        You have to create and pass a proposal in another governance process to remove admin control
                        from the DAO.
                    </p>
                    <p>This should only be done when the DAO is ready and no longer requires admin control.</p>
                </div>
            </DialogAlert.Content>
            <DialogAlertFooter
                actionButton={{ label: 'Select process', onClick: handleSelectProcessClick }}
                cancelButton={{ label: 'Cancel', onClick: onClose }}
            />
        </DialogAlert.Root>
    );
};
