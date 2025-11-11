import type { IGetDaoByEnsParams, IGetDaoParams, IGetDaoPermissionsParams } from './daoService.api';

export enum DaoServiceKey {
    DAO = 'DAO',
    DAO_BY_ENS = 'DAO_BY_ENS',
    DAO_PERMISSIONS = 'DAO_PERMISSIONS',
}

export const daoServiceKeys = {
    dao: (params: IGetDaoParams) => [DaoServiceKey.DAO, params],
    daoByEns: (params: IGetDaoByEnsParams) => [DaoServiceKey.DAO_BY_ENS, params],
    daoPermissions: (params: IGetDaoPermissionsParams) => [DaoServiceKey.DAO_PERMISSIONS, params],
};
