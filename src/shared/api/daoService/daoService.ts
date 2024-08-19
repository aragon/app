import { AragonBackendService } from '../aragonBackendService';
import type { IGetDaoParams, IGetDaoSettingsParams } from './daoService.api';
import type { IDao, IDaoSettings } from './domain';

class DaoService extends AragonBackendService {
    private urls = {
        dao: '/daos/:id',
        daoSettings: '/settings/active/:daoId',
    };

    getDao = async (params: IGetDaoParams): Promise<IDao> => {
        const result = await this.request<IDao>(this.urls.dao, params);

        return result;
    };

    getDaoSettings = async <TSettings extends IDaoSettings = IDaoSettings>(
        params: IGetDaoSettingsParams,
    ): Promise<TSettings> => {
        const result = await this.request<TSettings>(this.urls.daoSettings, params);

        return result;
    };
}

export const daoService = new DaoService();
