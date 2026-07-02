import { stringUtils } from '@/shared/utils/stringUtils';
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

/**
 * Placeholder rendered for conditions that have no human-readable label
 * (unconditional grants and unresolvable condition types).
 */
const NO_LABEL = '-';

/**
 * Explicit display labels for the known condition types. Any other non-empty
 * type falls back to a Pascal-cased rendering of its discriminator.
 */
const CONDITION_LABELS: Record<string, string> = {
    'voting-power': 'VotingPower',
    'execute-selector': 'ExecuteSelector',
};

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

    /**
     * Resolves a human-readable label for a condition type, used by the
     * collapsed permission row's CONDITION cell.
     *
     * - `'none'` / `'unknown'` -> {@link NO_LABEL} (`'-'`).
     * - a known type -> its explicit label (e.g. `'voting-power'` ->
     *   `'VotingPower'`).
     * - any other non-empty type -> a Pascal-cased fallback (e.g.
     *   `'merkle-claim'` -> `'MerkleClaim'`).
     *
     * @param conditionType The resolved condition type discriminator.
     * @returns The display label for the condition type.
     */
    getConditionLabel = (conditionType: string): string => {
        if (
            conditionType === NO_CONDITION ||
            conditionType === UNKNOWN_CONDITION ||
            conditionType.length === 0
        ) {
            return NO_LABEL;
        }

        return (
            CONDITION_LABELS[conditionType] ??
            stringUtils.toPascalCase(conditionType)
        );
    };
}

export const conditionTypeUtils = new ConditionTypeUtils();
