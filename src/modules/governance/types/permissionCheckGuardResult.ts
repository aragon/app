export interface IPermissionCheckGuardSetting {
    /**
     * Term of the permission setting.
     */
    term: string;
    /**
     * Definition of the permission setting.
     */
    definition: string;
    /**
     * Displays the setting as link with the specified url when set.
     */
    href?: string;
}

export interface IPermissionCheckGuardResult {
    /**
     * Defines if the user has permission or not.
     */
    hasPermission: boolean;
    /**
     * Settings to be displayed as reason on why the user does not have the specified permission.
     * The settings are grouped by condition.
     */
    settings: IPermissionCheckGuardSetting[][];
    /**
     * Indicates if the slot-function is loading the data needed to check the specific permission.
     */
    isLoading?: boolean;
    /**
     * Indicates if there are restrictions on the action.
     */
    isRestricted: boolean;
}
