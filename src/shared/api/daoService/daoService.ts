import { AragonBackendService } from '../aragonBackendService';
import type { IGetDaoByEnsParams, IGetDaoParams, IGetDaoPermissionsParams } from './daoService.api';
import type { IDao, IDaoPermission } from './domain';

class DaoService extends AragonBackendService {
    private urls = {
        dao: '/v2/daos/:id',
        daoByEns: '/v2/daos/:network/ens/:ens',
        daoPermissions: '/v2/permissions/:network/:daoAddress',
    };

    getDao = async (params: IGetDaoParams): Promise<IDao> => {
        const result = await this.request<IDao>(this.urls.dao, params);

        return result;
    };

    getDaoByEns = async (params: IGetDaoByEnsParams): Promise<IDao> => {
        const result = await this.request<IDao>(this.urls.daoByEns, params);

        return result;
    };

    getDaoPermissions = async (params: IGetDaoPermissionsParams): Promise<IDaoPermission[]> => {
        const result = await this.request<IDaoPermission[]>(this.urls.daoPermissions, params);

        return result;
    };
}

export const daoService = new DaoService();
