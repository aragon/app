import { AragonBackendService } from '../aragonBackendService';
import type { IDaoPlugin } from '../daoService';
import type { IGetPluginsByDaoParams } from './pluginsService.api';

class PluginsService extends AragonBackendService {
    private readonly urls = {
        pluginsByDao: '/v2/plugins/by-dao/:network/:address/details',
    };

    getPluginsByDao = async (params: IGetPluginsByDaoParams): Promise<IDaoPlugin[]> => {
        const result = await this.request<IDaoPlugin[]>(this.urls.pluginsByDao, params);

        return result;
    };
}

export const pluginsService = new PluginsService();
