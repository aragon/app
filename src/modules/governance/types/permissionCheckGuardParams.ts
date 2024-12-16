import type { IDaoPlugin, IPluginSettings } from '@/shared/api/daoService';

export interface IUseGuardBaseParams {
    /**
     * Callback called when the user is capable of participating.
     */
    onSuccess?: () => void;
    /**
     * Callback called when the user cannot participate.
     */
    onError?: () => void;
}

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

export interface IUsePermissionCheckGuardParams extends IUseGuardBaseParams {
    /**
     * Parameters to be forwarded to the plugin-specific slot function.
     */
    slotParams: IUsePermissionCheckGuardSlotParams<IPluginSettings>;
    /**
     * Slot ID to use for checking the user permissions.
     */
    slotId: string;
}
