import { AragonBackendService } from '../aragonBackendService';
import type { IGetDaoByEnsParams, IGetDaoParams, IGetPluginsByDaoParams } from './daoService.api';
import type { IDao, IDaoPlugin } from './domain';

class DaoService extends AragonBackendService {
    private urls = {
        dao: '/v2/daos/:id',
        daoByEns: '/v2/daos/:network/ens/:ens',
        pluginsByDao: '/plugins/by-dao/:network/:daoAddress',
    };

    getDao = async (params: IGetDaoParams): Promise<IDao> => {
        const result = await this.request<IDao>(this.urls.dao, params);

        return result;
    };

    getDaoByEns = async (params: IGetDaoByEnsParams): Promise<IDao> => {
        const result = await this.request<IDao>(this.urls.daoByEns, params);

        return result;
    };

    getPluginsByDao = async (params: IGetPluginsByDaoParams): Promise<IDaoPlugin[]> => {
        const result = await this.request<IDaoPlugin[]>(this.urls.pluginsByDao, params);

        return result;
    };
}

export const daoService = new DaoService();
