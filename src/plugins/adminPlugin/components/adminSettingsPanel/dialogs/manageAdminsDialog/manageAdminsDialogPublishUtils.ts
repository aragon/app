import { type IBuildCreateProposalDataParams } from '@/modules/governance/types';
import { type TransactionDialogPrepareReturn } from '@/shared/components/transactionDialog';
import { transactionUtils } from '@/shared/utils/transactionUtils';
import { addressUtils } from '@aragon/gov-ui-kit';
import { encodeFunctionData, type Hex } from 'viem';
import { adminTransactionUtils } from '../../../../utils/adminTransactionUtils';
import { permissionManagerAbi } from '../../../../../../shared/utils/permissionTransactionUtils/abi/permissionManagerAbi';
import type {
    IBuildActionsArrayParams,
    IBuildTransactionParams,
    IEncodeDataParams,
} from './manageAdminsDialogPublishUtils.abi';

class ManageAdminsDialogPublishUtils {
    private proposalMetadata = {
        title: 'Manage admins proposal',
        summary: 'This proposal manages the admins of the DAO',
    };

    prepareProposalMetadata = () => this.proposalMetadata;

    buildActionsArray = (params: IBuildActionsArrayParams) => {
        const { currentAdmins, updatedAdmins, pluginAddress, daoAddress } = params;

        const EXECUTE_PROPOSAL_PERMISSION_ID =
            '0xf281525e53675515a6ba7cc7bea8a81e649b3608423ee2d73be1752cea887889' as Hex;

        const adminsToAdd = updatedAdmins.filter(
            (admin) => !currentAdmins.some((member) => addressUtils.isAddressEqual(member.address, admin.address)),
        );

        const adminsToRemove = currentAdmins.filter(
            (admin) => !updatedAdmins.some((member) => addressUtils.isAddressEqual(member.address, admin.address)),
        );

        const grantActions = adminsToAdd.map((admin) => {
            const encodeParams = {
                where: pluginAddress,
                who: admin.address as Hex,
                permissionId: EXECUTE_PROPOSAL_PERMISSION_ID,
            };

            return {
                to: daoAddress,
                value: '0',
                data: this.encodeGrantCalldata(encodeParams),
            };
        });

        const revokeActions = adminsToRemove.map((admin) => {
            const encodeParams = {
                where: pluginAddress,
                who: admin.address as Hex,
                permissionId: EXECUTE_PROPOSAL_PERMISSION_ID,
            };

            return {
                to: daoAddress,
                value: '0',
                data: this.encodeRevokeCalldata(encodeParams),
            };
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

    private encodeGrantCalldata = (params: IEncodeDataParams) => {
        const { where, who, permissionId } = params;

        return encodeFunctionData({
            abi: permissionManagerAbi,
            functionName: 'grant',
            args: [where, who, permissionId],
        });
    };

    private encodeRevokeCalldata = (params: IEncodeDataParams) => {
        const { where, who, permissionId } = params;

        return encodeFunctionData({
            abi: permissionManagerAbi,
            functionName: 'revoke',
            args: [where, who, permissionId],
        });
    };
}

export const manageAdminsDialogPublishUtils = new ManageAdminsDialogPublishUtils();
