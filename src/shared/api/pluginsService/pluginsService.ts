import { AragonBackendService } from '../aragonBackendService';
import type { IDaoPlugin } from '../daoService';
import type { IGetDaoPluginsByDaoParams } from './pluginsService.api';

class PluginsService extends AragonBackendService {
    private urls = {
        pluginsByDao: '/v2/plugins/by-dao/:network/:address/details',
    };

    getDaoPluginsByDao = async (params: IGetDaoPluginsByDaoParams): Promise<IDaoPlugin[]> => {
        const result = await this.request<IDaoPlugin[]>(this.urls.pluginsByDao, params);

        return result;
    };
}

export const pluginsService = new PluginsService();
