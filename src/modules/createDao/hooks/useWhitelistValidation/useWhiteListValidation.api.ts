import type { IPluginInfo } from '@/shared/types';

export interface IWhitelistValidationParams {
    /**
     * List of plugins to validate.
     */
    plugins: IPluginInfo[];
}

export interface IWhitelistValidationResult {
    /**
     * List of plugins that are enabled for the current user.
     */
    enabledPlugins: IPluginInfo[];
    /**
     * List of plugins that are disabled for the current user.
     */
    disabledPlugins: IPluginInfo[];
}
