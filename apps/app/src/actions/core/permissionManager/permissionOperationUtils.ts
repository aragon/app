import type { IProposalActionInputDataParameter } from '@aragon/gov-ui-kit';
import type { Hex } from 'viem';
import { permissionNameUtils } from '@/shared/utils/permissionNameUtils';

/**
 * `PermissionLib.Operation` as deployed in OSx. Verified against the DAO implementation
 * on chain: `enum Operation { Grant, Revoke, GrantWithCondition }`. Reading these
 * backwards inverts the meaning of an action, so they are not inferred from position.
 */
export enum PermissionOperation {
    GRANT = 0,
    REVOKE = 1,
    GRANT_WITH_CONDITION = 2,
}

const zeroAddress = `0x${'0'.repeat(40)}`;

export interface IPermissionChange {
    /**
     * Whether the entry grants or revokes, and whether a condition gates it.
     */
    operation: PermissionOperation;
    /**
     * Contract the permission applies to.
     */
    where: Hex;
    /**
     * Address receiving or losing the permission.
     */
    who: Hex;
    /**
     * Condition gating the grant, or undefined when unconditional. The zero address is
     * OSx's "no condition" sentinel and is normalised away here.
     */
    condition?: Hex;
    /**
     * Raw keccak256 permission id, always kept as the audit trail.
     */
    permissionId: Hex;
    /**
     * Resolved permission name, or undefined when the id is outside the known set.
     */
    permissionName?: string;
}

class PermissionOperationUtils {
    /**
     * Reads a permission tuple array into one entry per change, zipping each row against
     * the ABI component names rather than trusting a fixed field order.
     *
     * `applySingleTargetPermissions` hoists the target out of the rows into a sibling
     * `_where` parameter and carries no condition, so `fallbackWhere` supplies it.
     */
    getPermissionChanges = (
        parameter: IProposalActionInputDataParameter,
        fallbackWhere?: string,
    ): IPermissionChange[] => {
        const { value, components } = parameter;

        if (!(Array.isArray(value) && components != null)) {
            return [];
        }

        const fieldIndex = Object.fromEntries(
            components.map((component, index) => [component.name, index]),
        );

        return value
            .filter((row): row is unknown[] => Array.isArray(row))
            .map((row) => {
                const field = (name: string): string =>
                    String(row[fieldIndex[name]] ?? '');
                const condition = field('condition');
                const permissionId = field('permissionId') as Hex;
                // applySingleTargetPermissions hoists the target out of the rows.
                const where = field('where') || (fallbackWhere ?? '');

                return {
                    operation: Number(
                        field('operation'),
                    ) as PermissionOperation,
                    where: where as Hex,
                    who: field('who') as Hex,
                    condition:
                        condition && condition !== zeroAddress
                            ? (condition as Hex)
                            : undefined,
                    permissionId,
                    permissionName:
                        permissionNameUtils.getKnownPermissionName(
                            permissionId,
                        ),
                };
            });
    };

    /**
     * Inverse of {@link getPermissionChanges}: serialises a change back into the
     * positional tuple the ABI encoder expects. Field order comes from the ABI
     * components, never a hardcoded order — getting it wrong silently swaps values
     * between columns and changes what the action does.
     */
    toRowValues = (
        change: IPermissionChange,
        componentNames: string[],
    ): string[] =>
        componentNames.map((name) => {
            switch (name) {
                case 'operation':
                    return change.operation.toString();
                case 'where':
                    return change.where;
                case 'who':
                    return change.who;
                case 'condition':
                    return change.condition ?? zeroAddress;
                case 'permissionId':
                    return change.permissionId;
                default:
                    return '';
            }
        });
}

export const permissionOperationUtils = new PermissionOperationUtils();
