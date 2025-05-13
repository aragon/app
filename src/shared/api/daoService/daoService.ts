import { AragonBackendService } from '../aragonBackendService';
import type { IGetDaoByEnsParams, IGetDaoParams } from './daoService.api';
import type { IDao } from './domain';

class DaoService extends AragonBackendService {
    private urls = {
        dao: '/daos/:id',
        daoByEns: '/daos/:network/ens/:ens',
    };

    getDao = async (params: IGetDaoParams): Promise<IDao> => {
        const result = await this.request<IDao>(this.urls.dao, params);

        return result;
    };

    getDaoByEns = async (params: IGetDaoByEnsParams): Promise<IDao> => {
        const result = await this.request<IDao>(this.urls.daoByEns, params);

        return result;
    };
}

export const daoService = new DaoService();
