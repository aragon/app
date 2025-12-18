import { encodeFunctionData, keccak256, toBytes, zeroHash } from 'viem';
import type { ITransactionRequest } from '../transactionUtils';
import { permissionManagerAbi } from './abi/permissionManagerAbi';
import type {
    IBuildExecuteConditionTransactionsParams,
    IBuildGrantWithConditionTransactionParams,
    IRuledCondition,
    IUpdatePermissionParams,
} from './permissionTransactionUtils.api';

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
    permissionIds = {
        rootPermission: 'ROOT_PERMISSION',
        createProposalPermission: 'CREATE_PROPOSAL_PERMISSION',
        executePermission: 'EXECUTE_PERMISSION',
        upgradePluginPermission: 'UPGRADE_PLUGIN_PERMISSION',
        manageSelectorsPermission: 'MANAGE_SELECTORS_PERMISSION',
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

    buildGrantWithConditionTransaction = (params: IBuildGrantWithConditionTransactionParams): ITransactionRequest => {
        const { where, who, what, to, condition } = params;
        const transactionData = encodeFunctionData({
            abi: permissionManagerAbi,
            functionName: 'grantWithCondition',
            args: [where, who, keccak256(toBytes(what)), condition],
        });
        return { to, data: transactionData, value: BigInt(0) };
    };

    buildExecuteConditionTransactions = (
        params: IBuildExecuteConditionTransactionsParams
    ): [ITransactionRequest, ITransactionRequest, ITransactionRequest] => {
        const { dao, plugin, executeCondition } = params;

        const revokeExecuteTransaction = this.buildRevokePermissionTransaction({
            where: dao,
            who: plugin,
            what: permissionTransactionUtils.permissionIds.executePermission,
            to: dao,
        });

        const grantExecuteTransaction = this.buildGrantWithConditionTransaction({
            where: dao,
            who: plugin,
            what: permissionTransactionUtils.permissionIds.executePermission,
            to: dao,
            condition: executeCondition,
        });

        const grantTransaction = this.buildGrantPermissionTransaction({
            where: executeCondition,
            who: dao,
            what: permissionTransactionUtils.permissionIds.manageSelectorsPermission,
            to: dao,
        });

        return [revokeExecuteTransaction, grantExecuteTransaction, grantTransaction];
    };

    buildGrantRevokePermissionTransactions = (params: IUpdatePermissionParams): [ITransactionRequest, ITransactionRequest] => {
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
    private encodeLogicalOperator = (firstIndex: number, secondIndex: number) => BigInt(firstIndex) + (BigInt(secondIndex) << BigInt(32));

    private addressToCondition = (address: string): IRuledCondition => ({
        id: this.ruleConditionId.condition,
        op: this.ruleConditionOperator.eq,
        value: address,
        permissionId: zeroHash,
    });
}

export const permissionTransactionUtils = new PermissionTransactionUtils();
