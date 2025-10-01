import type { IGetPluginInstallationDataParams, IGetPluginLogsParams } from './settingsService.api';

export enum SettingsServiceKey {
    PLUGIN_INSTALLATION_DATA = 'PLUGIN_INSTALLATION_DATA',
    PLUGIN_LOGS = 'PLUGIN_LOGS',
}

export const settingsServiceKeys = {
    pluginInstallationData: (params: IGetPluginInstallationDataParams) => [
        SettingsServiceKey.PLUGIN_INSTALLATION_DATA,
        params,
    ],
    pluginLogs: (params: IGetPluginLogsParams) => [SettingsServiceKey.PLUGIN_LOGS, params],
};
