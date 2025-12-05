import type {
    IGetDaoByEnsParams,
    IGetDaoParams,
    IGetDaoPermissionsParams,
    IGetDaoPoliciesParams,
} from './daoService.api';

export enum DaoServiceKey {
    DAO = 'DAO',
    DAO_BY_ENS = 'DAO_BY_ENS',
    DAO_PERMISSIONS = 'DAO_PERMISSIONS',
    DAO_POLICIES = 'DAO_POLICIES',
}

export const daoServiceKeys = {
    dao: (params: IGetDaoParams) => [DaoServiceKey.DAO, params],
    daoByEns: (params: IGetDaoByEnsParams) => [DaoServiceKey.DAO_BY_ENS, params],
    daoPermissions: (params: IGetDaoPermissionsParams) => [DaoServiceKey.DAO_PERMISSIONS, params],
    daoPolicies: (params: IGetDaoPoliciesParams) => [DaoServiceKey.DAO_POLICIES, params],
};
