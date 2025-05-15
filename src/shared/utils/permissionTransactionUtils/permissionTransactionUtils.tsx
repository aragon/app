import { encodeFunctionData, keccak256, toBytes, zeroHash } from 'viem';
import type { ITransactionRequest } from '../transactionUtils';
import { permissionManagerAbi } from './abi/permissionManagerAbi';
import type { IRuledCondition, IUpdatePermissionParams } from './permissionTransactionUtils.api';

class PermissionTransactionUtils {
    // Identifiers of rule conditions
    // See https://github.com/aragon/osx-commons/blob/develop/contracts/src/permission/condition/extensions/RuledCondition.sol#L12
    private ruleConditionId = {
        condition: 202,
        logicOperation: 203,
    };

    // Operations for conditions
    // See https://github.com/aragon/osx-commons/blob/develop/contracts/src/permission/condition/extensions/RuledCondition.sol#L43
    private ruleConditionOperator = {
        eq: 1,
        or: 10,
    };

    // List of generic permission IDs
    public permissionIds = {
        rootPermission: 'ROOT_PERMISSION',
        createProposalPermission: 'CREATE_PROPOSAL_PERMISSION',
        executePermission: 'EXECUTE_PERMISSION',
        upgradePluginPermission: 'UPGRADE_PLUGIN_PERMISSION',
    };

    buildGrantPermissionTransaction = (params: IUpdatePermissionParams): ITransactionRequest => {
        const { where, who, what, to } = params;
        const transactionData = encodeFunctionData({
            abi: permissionManagerAbi,
            functionName: 'grant',
            args: [where, who, keccak256(toBytes(what))],
        });

        return { to, data: transactionData, value: BigInt(0) };
    };

    buildRevokePermissionTransaction = (params: IUpdatePermissionParams): ITransactionRequest => {
        const { where, who, what, to } = params;
        const transactionData = encodeFunctionData({
            abi: permissionManagerAbi,
            functionName: 'revoke',
            args: [where, who, keccak256(toBytes(what))],
        });

        return { to, data: transactionData, value: BigInt(0) };
    };

    buildGrantRevokePermissionTransactions = (
        params: IUpdatePermissionParams,
    ): [ITransactionRequest, ITransactionRequest] => {
        const grantTransaction = this.buildGrantPermissionTransaction(params);
        const revokeTransaction = this.buildRevokePermissionTransaction(params);

        return [grantTransaction, revokeTransaction];
    };

    buildRuleConditions = (conditionAddresses: string[], conditionRules: IRuledCondition[]): IRuledCondition[] => {
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
            ...this.buildRuleConditions(conditionAddresses, [...conditionRules, newCondition]),
            this.addressToCondition(conditionAddress),
        ];
    };

    // Encodes two rules indexes into a uint240 value
    // See https://github.com/aragon/osx-commons/blob/develop/contracts/src/permission/condition/extensions/RuledCondition.sol#L315
    private encodeLogicalOperator = (firstIndex: number, secondIndex: number) =>
        BigInt(firstIndex) + (BigInt(secondIndex) << BigInt(32));

    private addressToCondition = (address: string): IRuledCondition => ({
        id: this.ruleConditionId.condition,
        op: this.ruleConditionOperator.eq,
        value: address,
        permissionId: zeroHash,
    });
}

export const permissionTransactionUtils = new PermissionTransactionUtils();
