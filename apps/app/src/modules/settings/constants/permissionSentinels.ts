/**
 * Canonical OSx permission sentinels.
 *
 * These are special addresses used by the OSx `PermissionManager` to encode
 * permission semantics rather than referencing a concrete account.
 *
 * NOTE: APP-953 may promote these to a shared location (e.g. a shared constants
 * module) once other modules need them. They live in the settings module for now
 * because the permission UI is the only consumer.
 */

/**
 * The OSx "any address" sentinel. When used as the `who` or `where` of a
 * permission, it means the permission applies to / from any address ("Anyone").
 * @see https://github.com/aragon/osx/blob/main/packages/contracts/src/core/permission/PermissionManager.sol
 */
export const ANY_ADDR = '0xffffffffffffffffffffffffffffffffffffffff' as const;

/**
 * The OSx `ALLOW_FLAG` sentinel, equal to `address(2)`. It is stored as the
 * permission condition to signal that the permission is granted unconditionally
 * ("no condition"), as opposed to being gated by a condition contract.
 * @see https://github.com/aragon/osx/blob/main/packages/contracts/src/core/permission/PermissionManager.sol
 */
export const ALLOW_FLAG = '0x0000000000000000000000000000000000000002' as const;
