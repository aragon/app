import { apiVersionUtils } from '@/shared/utils/apiVersionUtils';
import type { IGetDaoByEnsParams, IGetDaoParams, IGetDaoPermissionsParams } from './daoService.api';

export enum DaoServiceKey {
    DAO = 'DAO',
    DAO_BY_ENS = 'DAO_BY_ENS',
    DAO_PERMISSIONS = 'DAO_PERMISSIONS',
}

export const daoServiceKeys = {
    dao: (params: IGetDaoParams) => [DaoServiceKey.DAO, apiVersionUtils.getApiVersion(), params],
    daoByEns: (params: IGetDaoByEnsParams) => [DaoServiceKey.DAO_BY_ENS, apiVersionUtils.getApiVersion(), params],
    daoPermissions: (params: IGetDaoPermissionsParams) => [
        DaoServiceKey.DAO_PERMISSIONS,
        'v2', // Permissions always use v2
        params,
    ],
};
