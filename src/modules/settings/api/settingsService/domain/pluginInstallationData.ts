import type { IPluginPreparedSetupData } from './pluginPreparedSetupData';

export interface IPluginInstallationData {
    /**
     * Setup data of the plugin.
     */
    preparedSetupData: IPluginPreparedSetupData;
}
