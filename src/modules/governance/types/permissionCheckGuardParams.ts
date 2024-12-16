import type { IDaoPlugin, IPluginSettings } from '@/shared/api/daoService';

export interface IUsePermissionCheckGuardSlotParams<TPluginSettings extends IPluginSettings> {
    /**
     * Plugin to check permissions for.
     */
    plugin: IDaoPlugin<TPluginSettings>;
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * Title of the permission check dialog.
     */
    title: string;
    /**
     * Description of the permission check dialog.
     */
    description: string;
}

export interface IUsePermissionCheckGuardParams {
    /**
     * Parameters to be forwarded to the plugin-specific slot function.
     */
    slotParams: IUsePermissionCheckGuardSlotParams<IPluginSettings>;
    /**
     * Slot ID to use for checking the user permissions.
     */
    slotId: string;
    /**
     * Callback called when the user has the required permissions.
     */
    onSuccess?: () => void;
    /**
     * Callback called when the user does not have the required permissions.
     */
    onError?: () => void;
}
