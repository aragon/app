import type { IProposalCreate, IPublishProposalDialogParams } from '@/modules/governance/dialogs/publishProposalDialog';
import type { ICreateProposalStartDateForm } from '@/modules/governance/utils/createProposalUtils';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { permissionTransactionUtils } from '@/shared/utils/permissionTransactionUtils';
import type { ITransactionRequest } from '@/shared/utils/transactionUtils';
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
        plugin: IDaoPlugin,
        daoId: string,
    ): IPublishProposalDialogParams {
        const action = this.buildRevokeAction(daoAddress, adminAddress);
        return {
            proposal: { ...this.buildProposalValues(daoAddress, adminAddress), actions: [action] },
            daoId,
            plugin,
        };
    }

    private buildProposalValues(daoAddress: Hex, adminAddress: Hex): IProposalCreate & ICreateProposalStartDateForm {
        const revokeAction = this.buildRevokeAction(daoAddress, adminAddress);

        return {
            ...this.prepareProposalMetadata(),
            body: '',
            resources: [],
            actions: [revokeAction],
            startTimeMode: 'now',
        };
    }

    private buildRevokeAction(daoAddress: Hex, adminAddress: Hex): ITransactionRequest {
        const rawAction = permissionTransactionUtils.buildRevokePermissionTransaction({
            where: daoAddress,
            who: adminAddress,
            what: this.permissionIds.EXECUTE_PERMISSION,
            to: daoAddress,
        });

        return rawAction;
    }
}

export const adminUninstallProcessDialogSelectUtils = new AdminUninstallProcessDialogSelectUtils();
