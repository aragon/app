import { AragonBackendService } from '@/shared/api/aragonBackendService';
import type { IPluginEventLog, IPluginInstallationData } from './domain';
import type {
    IGetLastPluginEventLogParams,
    IGetPluginInstallationDataParams,
} from './settingsService.api';

class SettingsService extends AragonBackendService {
    private urls = {
        pluginInstallationData: '/v2/plugins/installation-data',
        lastPluginEventLog: '/v2/plugins/logs/:pluginAddress/:network/:event',
    };

    getPluginInstallationData = async ({
        queryParams,
    }: IGetPluginInstallationDataParams): Promise<IPluginInstallationData> => {
        const result = await this.request<IPluginInstallationData>(
            this.urls.pluginInstallationData,
            { queryParams },
        );

        return result;
    };

    getLastPluginEventLog = async (
        params: IGetLastPluginEventLogParams,
    ): Promise<IPluginEventLog> => {
        const result = await this.request<IPluginEventLog>(
            this.urls.lastPluginEventLog,
            params,
        );

        return result;
    };
}

export const settingsService = new SettingsService();
