import { AragonBackendService } from '@/shared/api/aragonBackendService';
import type { IPluginInstallationData } from './domain';
import type { IGetPluginInstallationDataParams } from './settingsService.api';

class SettingsService extends AragonBackendService {
    private urls = {
        pluginInstallationData: '/plugins/installation-data',
    };

    getPluginInstallationData = async ({
        queryParams,
    }: IGetPluginInstallationDataParams): Promise<IPluginInstallationData> => {
        const result = await this.request<IPluginInstallationData>(this.urls.pluginInstallationData, { queryParams });

        return result;
    };
}

export const settingsService = new SettingsService();
