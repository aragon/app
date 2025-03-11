import type { ICreateProposalFormData, IProposalActionData } from '@/modules/governance/components/createProposalForm';
import type { IPublishProposalDialogParams } from '@/modules/governance/dialogs/publishProposalDialog';
import type { ICreateProposalStartDateForm } from '@/modules/governance/utils/createProposalUtils';
import { permissionTransactionUtils } from '@/shared/utils/permissionTransactionUtils';
import type { Hex } from 'viem';

class AdminUninstallProcessDialogSelectUtils {
    private permissionIds = {
        EXECUTE_PERMISSION: 'EXECUTE_PERMISSION',
    };

    private proposalMetadata = {
        title: 'Remove all admins',
        summary:
            'This proposal intends to remove all admin control of the DAO. The action will revoke their permission to execute transactions on behalf of the DAO. By passing the proposal, it signifies that this governance process is configured properly and is able to execute on behalf of the DAO now.',
    };

    prepareProposalMetadata = () => this.proposalMetadata;

    buildProposalParams(
        daoAddress: Hex,
        adminAddress: Hex,
        pluginAddress: Hex,
        daoId: string,
    ): IPublishProposalDialogParams {
        return {
            values: this.buildProposalValues(daoAddress, adminAddress, daoId),
            daoId,
            pluginAddress,
            prepareActions: {},
        };
    }

    private buildRevokeAction(daoAddress: Hex, adminAddress: Hex, daoId: string): IProposalActionData {
        const rawAction = permissionTransactionUtils.buildRevokePermissionTransaction({
            where: daoAddress,
            who: adminAddress,
            what: this.permissionIds.EXECUTE_PERMISSION,
            to: daoAddress,
        });

        return {
            ...rawAction,
            from: daoAddress,
            type: 'function',
            inputData: null,
            daoId,
            meta: undefined,
        };
    }

    private buildProposalValues(
        daoAddress: Hex,
        adminAddress: Hex,
        daoId: string,
    ): ICreateProposalFormData & ICreateProposalStartDateForm {
        const revokeAction = this.buildRevokeAction(daoAddress, adminAddress, daoId);

        return {
            ...this.prepareProposalMetadata(),
            body: '',
            addActions: true,
            resources: [],
            actions: [revokeAction],
            startTimeMode: 'now',
        };
    }
}

export const adminUninstallProcessDialogSelectUtils = new AdminUninstallProcessDialogSelectUtils();
