import {
    type AbiFunction,
    type Hex,
    parseAbiItem,
    toFunctionSelector,
} from 'viem';

/**
 * Function signatures of the DAO permission entry points, and the selectors derived
 * from them. The selector is what the action view registry matches on, so a permission
 * action decoded from calldata resolves even when it carries no action type.
 *
 * The parameter names follow the deployed `PermissionManager` and `PermissionLib`: the
 * bulk editor addresses tuple cells by component name, so a composer action built from
 * these signatures must carry the same names a decoded one does. Names are not part of
 * the selector, so renaming one cannot move it.
 */
export const permissionActionSignatures = {
    grant: 'function grant(address _where, address _who, bytes32 _permissionId)',
    revoke: 'function revoke(address _where, address _who, bytes32 _permissionId)',
    grantWithCondition:
        'function grantWithCondition(address _where, address _who, bytes32 _permissionId, address _condition)',
    applySingleTargetPermissions:
        'function applySingleTargetPermissions(address _where, (uint8 operation, address who, bytes32 permissionId)[] items)',
    applyMultiTargetPermissions:
        'function applyMultiTargetPermissions((uint8 operation, address where, address who, address condition, bytes32 permissionId)[] _items)',
} as const;

export type PermissionActionKey = keyof typeof permissionActionSignatures;

const parseSignature = (signature: string): AbiFunction =>
    parseAbiItem(signature) as AbiFunction;

export const permissionActionAbis: Record<PermissionActionKey, AbiFunction> = {
    grant: parseSignature(permissionActionSignatures.grant),
    revoke: parseSignature(permissionActionSignatures.revoke),
    grantWithCondition: parseSignature(
        permissionActionSignatures.grantWithCondition,
    ),
    applySingleTargetPermissions: parseSignature(
        permissionActionSignatures.applySingleTargetPermissions,
    ),
    applyMultiTargetPermissions: parseSignature(
        permissionActionSignatures.applyMultiTargetPermissions,
    ),
};

export const permissionActionSelectors: Record<PermissionActionKey, Hex> = {
    grant: toFunctionSelector(permissionActionAbis.grant),
    revoke: toFunctionSelector(permissionActionAbis.revoke),
    grantWithCondition: toFunctionSelector(
        permissionActionAbis.grantWithCondition,
    ),
    applySingleTargetPermissions: toFunctionSelector(
        permissionActionAbis.applySingleTargetPermissions,
    ),
    applyMultiTargetPermissions: toFunctionSelector(
        permissionActionAbis.applyMultiTargetPermissions,
    ),
};
