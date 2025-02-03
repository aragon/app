import type { ICreateProcessFormData } from '@/modules/createDao/components/createProcessForm';
import {
    type IPluginSetupData,
    prepareProcessDialogUtils,
} from '@/modules/createDao/dialogs/prepareProcessDialog/prepareProcessDialogUtils';
import { daoAbi } from '@/modules/createDao/dialogs/publishProcessDialog/abi/daoAbi';
import { sppTransactionUtils } from '@/plugins/sppPlugin/utils/sppTransactionUtils';
import { encodeFunctionData, type Hex, keccak256, toBytes, zeroHash } from 'viem';
import { pluginUtils } from '../pluginUtils';

export interface IConditionRule {
    id: number;
    op: number;
    value: bigint | string;
    permissionId: string;
}

export interface IUpdatePermissionParams {
    where: Hex;
    who: Hex;
    what: string;
    to: Hex;
}

export interface IUpdatePermissionWithConditionParams extends IUpdatePermissionParams {
    condition: Hex;
}

class PermissionTransactionUtils {
    private anyAddress: Hex = '0xffffffffffffffffffffffffffffffffffffffff';

    private permissionIds = {
        applyMultiTargetPermission: 'ROOT_PERMISSION', // TODO: failing without root-permission
        createProposalPermission: 'CREATE_PROPOSAL_PERMISSION',
        executePermission: 'EXECUTE_PERMISSION',
    };

    // // Identifiers of rule conditions (see https://github.com/aragon/osx-commons/blob/develop/contracts/src/permission/condition/extensions/RuledCondition.sol#L12)
    private ruleConditionId = {
        condition: 202,
        logicOperation: 203,
    };

    // // Operations for conditions (see https://github.com/aragon/osx-commons/blob/develop/contracts/src/permission/condition/extensions/RuledCondition.sol#L43)
    private ruleConditionOperator = {
        eq: 1,
        or: 10,
    };

    buildInstallActions = (values: ICreateProcessFormData, setupData: IPluginSetupData[], daoAddress: Hex) => {
        const pluginAddresses = setupData.map((data) => data.pluginAddress);

        const grantMultiTargetPermissionAction = this.buildGrantPermissionTransaction({
            where: daoAddress,
            who: prepareProcessDialogUtils.pspRepoAddress,
            what: this.permissionIds.applyMultiTargetPermission,
            to: daoAddress,
        });
        const applyInstallationActions = pluginUtils.buildApplyInstallationTransactions(setupData, daoAddress);
        const updateStagesAction = sppTransactionUtils.buildUpdateStagesTransaction(values, pluginAddresses);
        const updateCreateProposalRulesAction = sppTransactionUtils.buildUpdateRulesTransaction(values, setupData);

        // Skip first setupData item as it is related to the SPP plugin
        const pluginPermissionActions = setupData.slice(1).map((pluginData) => {
            const { pluginAddress: bodyAddress } = pluginData;

            // No one should be able to create proposals directly on sub-plugins
            const revokePluginCreateProposalAction = this.buildRevokePermissionTransaction({
                where: bodyAddress,
                who: this.anyAddress,
                what: this.permissionIds.createProposalPermission,
                to: daoAddress,
            });

            // Allow SPP to create proposals on sub-plugins
            const grantSppCreateProposalAction = this.buildGrantPermissionTransaction({
                where: bodyAddress,
                who: pluginAddresses[0], // SPP address
                what: this.permissionIds.createProposalPermission,
                to: daoAddress,
            });

            // Sub-plugin shouldn't have execute permission as SPP will already have it
            const revokeExecutePermission = this.buildRevokePermissionTransaction({
                where: daoAddress,
                who: bodyAddress,
                what: this.permissionIds.executePermission,
                to: daoAddress,
            });

            return [revokePluginCreateProposalAction, grantSppCreateProposalAction, revokeExecutePermission];
        });

        const revokeMultiTargetPermissionAction = this.buildRevokePermissionTransaction({
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

    private buildGrantPermissionTransaction = (params: IUpdatePermissionParams) => {
        const { where, who, what, to } = params;
        const transactionData = encodeFunctionData({
            abi: daoAbi,
            functionName: 'grant',
            args: [where, who, keccak256(toBytes(what))],
        });

        return { to, data: transactionData, value: '0' };
    };

    private buildRevokePermissionTransaction = (params: IUpdatePermissionParams) => {
        const { where, who, what, to } = params;
        const transactionData = encodeFunctionData({
            abi: daoAbi,
            functionName: 'revoke',
            args: [where, who, keccak256(toBytes(what))],
        });

        return { to, data: transactionData, value: '0' };
    };

    buildCreateProposalRuleConditions = (
        conditionAddresses: string[],
        conditionRules: IConditionRule[],
    ): IConditionRule[] => {
        if (!conditionAddresses.length) {
            return conditionRules;
        }

        if (conditionAddresses.length === 1) {
            return [...conditionRules, this.addressToCondition(conditionAddresses[0])];
        }

        const conditionAddress = conditionAddresses.pop()!;
        const { logicOperation } = this.ruleConditionId;
        const { or } = this.ruleConditionOperator;

        const baseIndex = conditionRules.length * 2;
        const value = this.encodeLogicalOperator(baseIndex + 1, baseIndex + 2);
        const newCondition = { id: logicOperation, op: or, value, permissionId: zeroHash };

        return [
            ...this.buildCreateProposalRuleConditions(conditionAddresses, [...conditionRules, newCondition]),
            this.addressToCondition(conditionAddress),
        ];
    };

    private encodeLogicalOperator = (firstIndex: number, secondIndex: number) =>
        BigInt(firstIndex) + (BigInt(secondIndex) << BigInt(32));

    private addressToCondition = (address: string): IConditionRule => ({
        id: this.ruleConditionId.condition,
        op: this.ruleConditionOperator.eq,
        value: address,
        permissionId: zeroHash,
    });
}

export const permissionTransactionUtils = new PermissionTransactionUtils();
