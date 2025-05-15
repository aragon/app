import type { IGetPluginInstallationDataParams } from './settingsService.api';

export enum SettingsServiceKey {
    PLUGIN_INSTALLATION_DATA = 'PLUGIN_INSTALLATION_DATA',
}

export const settingsServiceKeys = {
    pluginInstallationData: (params: IGetPluginInstallationDataParams) => [
        SettingsServiceKey.PLUGIN_INSTALLATION_DATA,
        params,
    ],
};
