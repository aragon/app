import { AragonBackendService, type IPaginatedResponse } from '../aragonBackendService';
import type { IGetDaoListByMemberAddressParams, IGetDaoParams, IGetDaoSettingsParams } from './daoService.api';
import type { IDao, IDaoSettings } from './domain';

class DaoService extends AragonBackendService {
    private urls = {
        dao: '/daos/:id',
        daoSettings: '/settings/active/:daoId',
        daoListByMemberAddress: '/daos/member/:address',
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

    getDaoListByMemberAddress = async ({
        urlParams,
        queryParams,
    }: IGetDaoListByMemberAddressParams): Promise<IPaginatedResponse<IDao>> => {
        const result = await this.request<IPaginatedResponse<IDao>>(this.urls.daoListByMemberAddress, {
            urlParams,
            queryParams,
        });

        return result;
    };
}

export const daoService = new DaoService();
