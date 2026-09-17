import { type Hex, toFunctionSelector } from 'viem';

/**
 * Function signatures of the DAO permission entry points, and the selectors derived
 * from them. The selector is what the action view registry matches on, so a permission
 * action decoded from calldata resolves even when it carries no action type.
 */
export const permissionActionSignatures = {
    grant: 'function grant(address,address,bytes32)',
    revoke: 'function revoke(address,address,bytes32)',
    grantWithCondition:
        'function grantWithCondition(address,address,bytes32,address)',
    applySingleTargetPermissions:
        'function applySingleTargetPermissions(address,(uint8,address,bytes32)[])',
    applyMultiTargetPermissions:
        'function applyMultiTargetPermissions((uint8,address,address,address,bytes32)[])',
} as const;

export const permissionActionSelectors: Record<
    keyof typeof permissionActionSignatures,
    Hex
> = {
    grant: toFunctionSelector(permissionActionSignatures.grant),
    revoke: toFunctionSelector(permissionActionSignatures.revoke),
    grantWithCondition: toFunctionSelector(
        permissionActionSignatures.grantWithCondition,
    ),
    applySingleTargetPermissions: toFunctionSelector(
        permissionActionSignatures.applySingleTargetPermissions,
    ),
    applyMultiTargetPermissions: toFunctionSelector(
        permissionActionSignatures.applyMultiTargetPermissions,
    ),
};
