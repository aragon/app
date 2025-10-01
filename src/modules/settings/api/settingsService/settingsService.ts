import { AragonBackendService } from '@/shared/api/aragonBackendService';
import type { IPluginInstallationData, IPluginLog } from './domain';
import type { IGetPluginInstallationDataParams, IGetPluginLogsParams } from './settingsService.api';

class SettingsService extends AragonBackendService {
    private urls = {
        pluginInstallationData: '/v2/plugins/installation-data',
        pluginLog: '/v2/plugins/logs/:pluginAddress/:network/:event',
    };

    getPluginInstallationData = async ({
        queryParams,
    }: IGetPluginInstallationDataParams): Promise<IPluginInstallationData> => {
        const result = await this.request<IPluginInstallationData>(this.urls.pluginInstallationData, { queryParams });

        return result;
    };

    getPluginLogs = async (params: IGetPluginLogsParams): Promise<IPluginLog> => {
        const result = await this.request<IPluginLog>(this.urls.pluginLog, params);

        return result;
    };
}

export const settingsService = new SettingsService();
