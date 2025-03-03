import { type IBuildCreateProposalDataParams } from '@/modules/governance/types';
import { type TransactionDialogPrepareReturn } from '@/shared/components/transactionDialog';
import { transactionUtils } from '@/shared/utils/transactionUtils';
import { addressUtils } from '@aragon/gov-ui-kit';
import { adminTransactionUtils } from '../../../../utils/adminTransactionUtils';
import type { IBuildActionsArrayParams, IBuildTransactionParams } from './manageAdminsDialogPublishUtils.api';
import { permissionTransactionUtils } from '@/shared/utils/permissionTransactionUtils';
import type { Hex } from 'viem';

class ManageAdminsDialogPublishUtils {
    private permissionIds = {
        EXECUTE_PROPOSAL_PERMISSION: 'EXECUTE_PROPOSAL_PERMISSION',
    };

    private proposalMetadata = {
        title: 'Manage admins proposal',
        summary: 'This proposal manages the admins of the DAO',
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

export const manageAdminsDialogPublishUtils = new ManageAdminsDialogPublishUtils();
