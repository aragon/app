import { AragonBackendService } from '../aragonBackendService';
import type { IGetDaoParams } from './daoService.api';
import type { IDao } from './domain';

class DaoService extends AragonBackendService {
    private urls = {
        dao: '/daos/:slug',
    };

    getDao = async (params: IGetDaoParams): Promise<IDao> => {
        const result = await this.request<IDao>(this.urls.dao, params);

        return result;
    };
}

export const daoService = new DaoService();
