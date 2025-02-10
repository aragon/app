import type { Hex } from 'viem';

export interface IRuledCondition {
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
     * For a basic condition rule (where id equals the CONDITION_RULE_ID), this holds the literal value that the rule
     * checks for equality.
     * For a composite logical rule (where id equals the LOGIC_OP_RULE_ID), this contains an encoded representation of
     * the indexes of the sub-conditions in the rule array.
     */
    value: bigint | string;
    /**
     * The identifier of the permission.
     */
    permissionId: string;
}

export interface IUpdatePermissionParams {
    /**
     * The address on which the permission will be set.
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
     * The address of the condition contract that must be satisfied for the permission to be granted or revoked.
     */
    condition: Hex;
}
