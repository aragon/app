import type { IProposalCreate, IPublishProposalDialogParams } from '@/modules/governance/dialogs/publishProposalDialog';
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

    buildProposalParams = (
        daoAddress: Hex,
        adminAddress: Hex,
        plugin: IDaoPlugin,
        daoId: string,
    ): IPublishProposalDialogParams => {
        const proposal = this.buildProposalValues(daoAddress, adminAddress);

        return { proposal, daoId, plugin };
    };

    private buildProposalValues = (daoAddress: Hex, adminAddress: Hex): IProposalCreate => {
        const revokeAction = this.buildRevokeAction(daoAddress, adminAddress);
        const proposalMetadata = this.prepareProposalMetadata();

        return { ...proposalMetadata, resources: [], actions: [revokeAction] };
    };

    private buildRevokeAction = (daoAddress: Hex, adminAddress: Hex): ITransactionRequest => {
        return permissionTransactionUtils.buildRevokePermissionTransaction({
            where: daoAddress,
            who: adminAddress,
            what: this.permissionIds.EXECUTE_PERMISSION,
            to: daoAddress,
        });
    };
}

export const adminUninstallProcessDialogSelectUtils = new AdminUninstallProcessDialogSelectUtils();
