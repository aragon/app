import type { IDaoPermission } from '@/shared/api/daoService';

/**
 * UI-side representation of a permission's resolved condition.
 *
 * `conditionType` is read straight off the payload (see ADR 0001). Additional,
 * condition-specific fields may be present, hence the open-ended index
 * signature.
 */
export interface IConditionData {
    /**
     * The resolved condition type discriminator (e.g. `'voting-power'`). An
     * empty or absent value is treated as `'unknown'` by the resolver.
     */
    conditionType: string;
    [key: string]: unknown;
}

/**
 * UI-only view model for a single permission row. Extends the domain
 * {@link IDaoPermission} with an optional resolved {@link IConditionData}.
 *
 * The domain type is never mutated; condition resolution happens at the UI
 * layer.
 */
export type IPermissionRow = IDaoPermission & {
    /**
     * Resolved condition payload for the permission, when available.
     */
    condition?: IConditionData;
};
