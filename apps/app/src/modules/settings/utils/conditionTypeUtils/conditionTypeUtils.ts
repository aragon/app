import type {
    IDaoPermission,
    IDaoPermissionCondition,
} from '@/shared/api/daoService';
import { stringUtils } from '@/shared/utils/stringUtils';
import { ALLOW_FLAG } from '../../constants/permissionSentinels';

/**
 * Discriminator returned when a permission is granted unconditionally
 * (condition equals {@link ALLOW_FLAG}).
 */
export const NO_CONDITION = 'none';

/**
 * Discriminator returned when the condition type cannot be resolved from the
 * payload (absent condition data or an empty/unrecognised `conditionType`).
 */
export const UNKNOWN_CONDITION = 'unknown';

/**
 * Placeholder rendered for conditions that have no human-readable label
 * (unconditional grants and empty condition types).
 */
const NO_LABEL = '-';

/**
 * Placeholder rendered when the permission references a condition address but
 * the condition payload could not be resolved or recognised.
 */
const UNKNOWN_LABEL = 'Unrecognized condition';

/**
 * Explicit display labels for the known condition types. Any other non-empty
 * type falls back to a Pascal-cased rendering of its discriminator.
 */
const CONDITION_LABELS: Record<string, string> = {
    'voting-power': 'VotingPower',
    'execute-selector': 'ExecuteSelector',
};

/**
 * Bundled condition display data, so callers don't repeat the
 * address/type/label/hasCondition/isUnrecognized computation.
 */
export interface IConditionDisplay {
    address: string;
    type: string;
    label: string;
    hasCondition: boolean;
    isUnrecognized: boolean;
}

class ConditionTypeUtils {
    /**
     * Resolves the display condition type for a permission.
     *
     * Per ADR 0001, the type is read straight off the payload; the only
     * resolution rules are:
     * - condition address equals {@link ALLOW_FLAG} (case-insensitive) ->
     *   `'none'`.
     * - a non-empty `conditionType` on the supplied data -> that value.
     * - otherwise -> `'unknown'`.
     *
     * @param conditionAddress The permission's on-chain condition address.
     * @param conditionData Optional resolved condition payload.
     * @returns The resolved condition type discriminator.
     */
    resolveConditionType = (
        conditionAddress: string,
        conditionData?: IDaoPermissionCondition,
    ): string => {
        if (conditionAddress.toLowerCase() === ALLOW_FLAG.toLowerCase()) {
            return NO_CONDITION;
        }

        const conditionType = conditionData?.conditionType;

        if (typeof conditionType === 'string' && conditionType.length > 0) {
            return conditionType;
        }

        return UNKNOWN_CONDITION;
    };

    /**
     * Resolves a human-readable label for a condition type, used by the
     * collapsed permission row's CONDITION cell.
     *
     * - `'none'` / empty -> {@link NO_LABEL} (`'-'`).
     * - `'unknown'` -> {@link UNKNOWN_LABEL} (`'Unrecognized condition'`).
     * - a known type -> its explicit label (e.g. `'voting-power'` ->
     *   `'VotingPower'`).
     * - any other non-empty type -> a Pascal-cased fallback (e.g.
     *   `'merkle-claim'` -> `'MerkleClaim'`).
     *
     * @param conditionType The resolved condition type discriminator.
     * @returns The display label for the condition type.
     */
    getConditionLabel = (conditionType: string): string => {
        if (conditionType === NO_CONDITION || conditionType.length === 0) {
            return NO_LABEL;
        }

        if (conditionType === UNKNOWN_CONDITION) {
            return UNKNOWN_LABEL;
        }

        return (
            CONDITION_LABELS[conditionType] ??
            stringUtils.toPascalCase(conditionType)
        );
    };

    /**
     * Resolves the full display bundle for a permission row's condition in one
     * call: the effective condition address, its type discriminator, its
     * human-readable label, whether a real condition is attached (address is
     * not {@link ALLOW_FLAG}), and whether the condition payload was
     * unrecognised. Replaces a 5-line block duplicated across the list views
     * and the graph edge panel.
     *
     * @param row The permission row (only `conditionAddress` / `condition`).
     * @returns The resolved condition display data.
     */
    resolveConditionDisplay = (
        row: Pick<IDaoPermission, 'conditionAddress' | 'condition'>,
    ): IConditionDisplay => {
        const address = row.conditionAddress ?? ALLOW_FLAG;
        const type = this.resolveConditionType(address, row.condition);

        return {
            address,
            type,
            label: this.getConditionLabel(type),
            hasCondition: address.toLowerCase() !== ALLOW_FLAG.toLowerCase(),
            isUnrecognized: type === UNKNOWN_CONDITION,
        };
    };
}

export const conditionTypeUtils = new ConditionTypeUtils();
