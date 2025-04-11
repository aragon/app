import { permissionTransactionUtils } from '@/shared/utils/permissionTransactionUtils';
import { addressUtils } from '@aragon/gov-ui-kit';
import type { Hex } from 'viem';
import type { IBuildActionsArrayParams } from './adminManageMembersDialogUtils.api';

class AdminManageMembersDialogUtils {
    private permissionIds = {
        EXECUTE_PROPOSAL_PERMISSION: 'EXECUTE_PROPOSAL_PERMISSION',
    };

    private proposalMetadata = {
        title: 'Update admins',
        summary: 'One or more changes have been made to who has permission to execute proposals via the admin plugin.',
    };

    prepareProposalMetadata = () => this.proposalMetadata;

    buildActionsArray = (params: IBuildActionsArrayParams) => {
        const { currentAdmins, updatedAdmins, pluginAddress, daoAddress } = params;

        const adminsToAdd = updatedAdmins.filter(
            (admin) => !currentAdmins.some((member) => addressUtils.isAddressEqual(member.address, admin.address)),
        );

        const adminsToRemove = currentAdmins.filter(
            (admin) => !updatedAdmins.some((member) => addressUtils.isAddressEqual(member.address, admin.address)),
        );

        const grantActions = adminsToAdd.map((admin) => {
            const params = {
                where: pluginAddress,
                who: admin.address as Hex,
                what: this.permissionIds.EXECUTE_PROPOSAL_PERMISSION,
                to: daoAddress,
            };

            return permissionTransactionUtils.buildGrantPermissionTransaction(params);
        });

        const revokeActions = adminsToRemove.map((admin) => {
            const params = {
                where: pluginAddress,
                who: admin.address as Hex,
                what: this.permissionIds.EXECUTE_PROPOSAL_PERMISSION,
                to: daoAddress,
            };

            return permissionTransactionUtils.buildRevokePermissionTransaction(params);
        });

        return [...grantActions, ...revokeActions];
    };
}

export const adminManageMembersDialogUtils = new AdminManageMembersDialogUtils();
