import { type IBuildCreateProposalDataParams } from '@/modules/governance/types';
import { type TransactionDialogPrepareReturn } from '@/shared/components/transactionDialog';
import { permissionTransactionUtils } from '@/shared/utils/permissionTransactionUtils';
import { transactionUtils } from '@/shared/utils/transactionUtils';
import { addressUtils } from '@aragon/gov-ui-kit';
import type { Hex } from 'viem';
import { adminTransactionUtils } from '../../utils/adminTransactionUtils';
import type { IBuildActionsArrayParams, IBuildTransactionParams } from './adminManageMembersDialogPublishUtils.api';

class AdminManageMembersDialogPublishUtils {
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

    buildTransaction = (params: IBuildTransactionParams) => {
        const { values, actions, metadataCid, pluginAddress } = params;

        const metadata = transactionUtils.cidToHex(metadataCid);

        const processedValues = { ...values, addActions: false, resources: [], actions: [] };

        const buildDataParams: IBuildCreateProposalDataParams = { actions, metadata, values: processedValues };
        const transactionData = adminTransactionUtils.buildCreateProposalData(buildDataParams);

        const transaction: TransactionDialogPrepareReturn = {
            to: pluginAddress,
            data: transactionData,
        };

        return Promise.resolve(transaction);
    };
}

export const adminManageMembersDialogPublishUtils = new AdminManageMembersDialogPublishUtils();
