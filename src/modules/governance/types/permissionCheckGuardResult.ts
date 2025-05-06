import type { IDefinitionSetting } from '@aragon/gov-ui-kit';

export interface IPermissionCheckGuardResult {
    /**
     * Defines if the user has permission or not.
     */
    hasPermission: boolean;
    /**
     * Settings to be displayed as reason on why the user does not have the specified permission.
     * The settings are grouped by condition.
     */
    settings: IDefinitionSetting[][];
    /**
     * Indicates if the slot-function is loading the data needed to check the specific permission.
     */
    isLoading?: boolean;
    /**
     * Indicates if there are restrictions on the action.
     */
    isRestricted: boolean;
}
