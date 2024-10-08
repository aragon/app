import { AragonBackendService } from '../aragonBackendService';
import type { IGetDaoParams } from './daoService.api';
import type { IDao } from './domain';

class DaoService extends AragonBackendService {
    private urls = {
        dao: '/daos/:id',
    };

    getDao = async (params: IGetDaoParams): Promise<IDao> => {
        const result = await this.request<IDao>(this.urls.dao, params);

        // TODO: remove when isBody, isProcess, isSubPlugin are properly returned from the backend
        return {
            ...result,
            plugins: result.plugins.map((plugin) => ({ ...plugin, isBody: true, isProcess: true, isSubPlugin: false })),
        };
    };
}

export const daoService = new DaoService();
