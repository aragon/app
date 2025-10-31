import { AragonBackendService, type IPaginatedResponse } from '../aragonBackendService';
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

    getDaoPermissions = async (params: IGetDaoPermissionsParams): Promise<IPaginatedResponse<IDaoPermission>> => {
        // return {
        //     metadata: {
        //         page: 1,
        //         pageSize: 1,
        //         totalPages: 1,
        //         totalRecords: 1,
        //     },
        //     data: [
        //         {
        //             whoAddress: '0xWho',
        //             whereAddress: '0xb2B8687c3BE0278C4296F722C3fB72D26725ce9B',
        //             permissionId: 'ID_TEST',
        //             conditionAddress: '0xCondition',
        //         },
        //     ],
        // };
        const result = await this.request<IPaginatedResponse<IDaoPermission>>(this.urls.daoPermissions, params);

        return result;
    };
}

export const daoService = new DaoService();
