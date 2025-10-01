import { AragonBackendService } from '@/shared/api/aragonBackendService';
import type { IPluginInstallationData, IPluginLogs } from './domain';
import type { IGetPluginInstallationDataParams, IGetPluginLogsParams } from './settingsService.api';

class SettingsService extends AragonBackendService {
    private urls = {
        pluginInstallationData: '/v2/plugins/installation-data',
        pluginLogs: '/v2/logs/:pluginAddress/:network/:event',
    };

    getPluginInstallationData = async ({
        queryParams,
    }: IGetPluginInstallationDataParams): Promise<IPluginInstallationData> => {
        const result = await this.request<IPluginInstallationData>(this.urls.pluginInstallationData, { queryParams });

        return result;
    };

    getPluginLogs = async (params: IGetPluginLogsParams): Promise<IPluginLogs> => {
        const result = await this.request<IPluginLogs>(this.urls.pluginLogs, params);

        return result;
    };
}

export const settingsService = new SettingsService();
