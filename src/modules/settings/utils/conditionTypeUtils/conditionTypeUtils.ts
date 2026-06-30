import { ALLOW_FLAG } from '../../constants/permissionSentinels';
import type { IConditionData } from '../../types';

/**
 * Discriminator returned when a permission is granted unconditionally
 * (condition equals {@link ALLOW_FLAG}).
 */
const NO_CONDITION = 'none';

/**
 * Discriminator returned when the condition type cannot be resolved from the
 * payload (absent condition data or an empty/unrecognised `conditionType`).
 */
const UNKNOWN_CONDITION = 'unknown';

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
        conditionData?: IConditionData,
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
}

export const conditionTypeUtils = new ConditionTypeUtils();
