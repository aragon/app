import { AragonBackendService } from '../aragonBackendService';
import type { IGetDaoParams } from './daoService.api';
import type { IDao } from './domain';

class DaoService extends AragonBackendService {
    private urls = {
        dao: '/daos/:id',
    };

    getDao = async (params: IGetDaoParams): Promise<IDao> => {
        const result = await this.request<IDao>(this.urls.dao, params);

        if (result.permalink === 'mainnet-0x397761F2d0f2aCf4a829F193B253c91e2CC7AAd4') {
            result.plugins[0].subdomain = 'plugin-id';
        }

        return result;
    };
}

export const daoService = new DaoService();
