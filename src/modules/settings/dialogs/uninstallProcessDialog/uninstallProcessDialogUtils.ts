import type { IProposalCreate } from '@/modules/governance/dialogs/publishProposalDialog';
import { permissionTransactionUtils } from '@/shared/utils/permissionTransactionUtils';
import type { Hex } from 'viem';

class UninstallProcessDialogUtils {
    private permissionIds = {
        EXECUTE_PERMISSION: 'EXECUTE_PERMISSION',
    };

    private proposalMetadata = {
        title: 'Remove all admins',
        summary:
            'This proposal intends to remove all admin control of the DAO. The action will revoke their permission to execute transactions on behalf of the DAO. By passing the proposal, it signifies that this governance process is configured properly and is able to execute on behalf of the DAO now.',
    };

    prepareProposalMetadata = () => this.proposalMetadata;

    buildProposal = (dao: Hex, plugin: Hex): IProposalCreate => {
        const proposalMetadata = this.prepareProposalMetadata();
        const action = permissionTransactionUtils.buildRevokePermissionTransaction({
            where: dao,
            who: plugin,
            what: this.permissionIds.EXECUTE_PERMISSION,
            to: dao,
        });

        return { ...proposalMetadata, resources: [], actions: [action] };
    };
}

export const uninstallProcessDialogUtils = new UninstallProcessDialogUtils();
