import type { IGetLastPluginEventLogParams, IGetPluginInstallationDataParams } from './settingsService.api';

export enum SettingsServiceKey {
    PLUGIN_INSTALLATION_DATA = 'PLUGIN_INSTALLATION_DATA',
    LAST_PLUGIN_EVENT_LOG = 'LAST_PLUGIN_EVENT_LOG',
}

export const settingsServiceKeys = {
    pluginInstallationData: (params: IGetPluginInstallationDataParams) => [
        SettingsServiceKey.PLUGIN_INSTALLATION_DATA,
        params,
    ],
    lastPluginEventLog: (params: IGetLastPluginEventLogParams) => [
        SettingsServiceKey.LAST_PLUGIN_EVENT_LOG,
        params,
    ],
};
