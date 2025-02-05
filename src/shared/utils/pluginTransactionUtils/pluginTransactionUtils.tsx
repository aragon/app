import type { ICreateProcessFormData } from '@/modules/createDao/components/createProcessForm';
import {
    prepareProcessDialogUtils,
    type IPluginSetupData,
} from '@/modules/createDao/dialogs/prepareProcessDialog/prepareProcessDialogUtils';
import { pluginSetupProcessorAbi } from '@/modules/createDao/dialogs/publishProcessDialog/abi/pluginSetupProcessorAbi';
import { sppTransactionUtils } from '@/plugins/sppPlugin/utils/sppTransactionUtils';
import { encodeAbiParameters, encodeFunctionData, keccak256, type Hex } from 'viem';
import { permissionTransactionUtils } from '../permissionTransactionUtils';

class PluginTransactionUtils {
    private anyAddress: Hex = '0xffffffffffffffffffffffffffffffffffffffff';

    private permissionIds = {
        applyMultiTargetPermission: 'ROOT_PERMISSION', // TODO: failing without root-permission
        createProposalPermission: 'CREATE_PROPOSAL_PERMISSION',
        executePermission: 'EXECUTE_PERMISSION',
    };
    hashHelpers = (helpers: readonly Hex[]): Hex => keccak256(encodeAbiParameters([{ type: 'address[]' }], [helpers]));

    buildApplyInstallationTransactions = (setupData: IPluginSetupData[], daoAddress: Hex) => {
        const installactionActions = setupData.map((data) => {
            const { pluginSetupRepo, versionTag, pluginAddress, preparedSetupData } = data;
            const { permissions, helpers } = preparedSetupData;

            const transactionData = encodeFunctionData({
                abi: pluginSetupProcessorAbi,
                functionName: 'applyInstallation',
                args: [
                    daoAddress,
                    {
                        pluginSetupRef: { versionTag, pluginSetupRepo },
                        plugin: pluginAddress,
                        permissions,
                        helpersHash: this.hashHelpers(helpers),
                    },
                ],
            });

            return { to: prepareProcessDialogUtils.pspRepoAddress, data: transactionData, value: '0' };
        });

        return installactionActions;
    };

    buildInstallActions = (values: ICreateProcessFormData, setupData: IPluginSetupData[], daoAddress: Hex) => {
        const pluginAddresses = setupData.map((data) => data.pluginAddress);

        const grantMultiTargetPermissionAction = permissionTransactionUtils.buildGrantPermissionTransaction({
            where: daoAddress,
            who: prepareProcessDialogUtils.pspRepoAddress,
            what: this.permissionIds.applyMultiTargetPermission,
            to: daoAddress,
        });
        const applyInstallationActions = pluginTransactionUtils.buildApplyInstallationTransactions(
            setupData,
            daoAddress,
        );
        const updateStagesAction = sppTransactionUtils.buildUpdateStagesTransaction(values, pluginAddresses);
        const updateCreateProposalRulesAction = sppTransactionUtils.buildUpdateRulesTransaction(values, setupData);

        // Skip first setupData item as it is related to the SPP plugin
        const pluginPermissionActions = setupData.slice(1).map((pluginData) => {
            const { pluginAddress: bodyAddress } = pluginData;

            // No one should be able to create proposals directly on sub-plugins
            const revokePluginCreateProposalAction = permissionTransactionUtils.buildRevokePermissionTransaction({
                where: bodyAddress,
                who: this.anyAddress,
                what: this.permissionIds.createProposalPermission,
                to: daoAddress,
            });

            // Allow SPP to create proposals on sub-plugins
            const grantSppCreateProposalAction = permissionTransactionUtils.buildGrantPermissionTransaction({
                where: bodyAddress,
                who: pluginAddresses[0], // SPP address
                what: this.permissionIds.createProposalPermission,
                to: daoAddress,
            });

            // Sub-plugin shouldn't have execute permission as SPP will already have it
            const revokeExecutePermission = permissionTransactionUtils.buildRevokePermissionTransaction({
                where: daoAddress,
                who: bodyAddress,
                what: this.permissionIds.executePermission,
                to: daoAddress,
            });

            return [revokePluginCreateProposalAction, grantSppCreateProposalAction, revokeExecutePermission];
        });

        const revokeMultiTargetPermissionAction = permissionTransactionUtils.buildRevokePermissionTransaction({
            where: daoAddress,
            who: prepareProcessDialogUtils.pspRepoAddress,
            what: this.permissionIds.applyMultiTargetPermission,
            to: daoAddress,
        });

        return [
            grantMultiTargetPermissionAction,
            ...applyInstallationActions,
            updateStagesAction,
            updateCreateProposalRulesAction,
            ...pluginPermissionActions.flat(),
            revokeMultiTargetPermissionAction,
        ].filter((action) => action != null);
    };
}

export const pluginTransactionUtils = new PluginTransactionUtils();
