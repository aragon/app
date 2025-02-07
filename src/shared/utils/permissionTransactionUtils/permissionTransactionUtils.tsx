import { encodeFunctionData, type Hex, keccak256, toBytes, zeroHash } from 'viem';
import { permissionManagerAbi } from './abi/permissionManagerAbi';

export interface IConditionRule {
    /**
     * Identifier for the type of rule (e.g., basic condition or logical operation).
     */
    id: number;
    /**
     * The operation to apply to the condition (AND OR IF_ELSE etc).
     */
    op: number;
    /**
     * The value associated with the rule.
     *
     * For a basic condition rule (where id equals the CONDITION_RULE_ID), this holds the literal value that the rule checks for equality.
     *
     * For a composite logical rule (where id equals the LOGIC_OP_RULE_ID), this contains an encoded
     * representation of the indexes of the sub-conditions in the rule array.
     * The smart contract later decodes this value to determine which sub-conditions to evaluate and how to combine their results.
     */
    value: bigint | string;
    /**
     * The identifier of the permission.
     */
    permissionId: string;
}

export interface IUpdatePermissionParams {
    /**
     *  The address on which the permission will be set.
     */
    where: Hex;
    /**
     * The address that will be granted or revoked the permission.
     */
    who: Hex;
    /**
     * A string that represents the permission.
     */
    what: string;
    /**
     * The address of the permission manager contract.
     */
    to: Hex;
}

export interface IUpdatePermissionWithConditionParams extends IUpdatePermissionParams {
    /**
     * The address  of the condition contract that must be satisfied for the permission to be granted or revoked.
     */
    condition: Hex;
}

class PermissionTransactionUtils {
    // Identifiers of rule conditions (see https://github.com/aragon/osx-commons/blob/develop/contracts/src/permission/condition/extensions/RuledCondition.sol#L12)
    private ruleConditionId = {
        condition: 202,
        logicOperation: 203,
    };

    // Operations for conditions (see https://github.com/aragon/osx-commons/blob/develop/contracts/src/permission/condition/extensions/RuledCondition.sol#L43)
    private ruleConditionOperator = {
        eq: 1,
        or: 10,
    };

    buildGrantPermissionTransaction = (params: IUpdatePermissionParams) => {
        const { where, who, what, to } = params;
        const transactionData = encodeFunctionData({
            abi: permissionManagerAbi,
            functionName: 'grant',
            args: [where, who, keccak256(toBytes(what))],
        });

        return { to, data: transactionData, value: '0' };
    };

    buildRevokePermissionTransaction = (params: IUpdatePermissionParams) => {
        const { where, who, what, to } = params;
        const transactionData = encodeFunctionData({
            abi: permissionManagerAbi,
            functionName: 'revoke',
            args: [where, who, keccak256(toBytes(what))],
        });

        return { to, data: transactionData, value: '0' };
    };

    buildRuleConditions = (conditionAddresses: string[], conditionRules: IConditionRule[]): IConditionRule[] => {
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
