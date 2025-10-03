import type { IGetDaoByEnsParams, IGetDaoParams, IGetPluginsByDaoParams } from './daoService.api';

export enum DaoServiceKey {
    DAO = 'DAO',
    DAO_BY_ENS = 'DAO_BY_ENS',
    PLUGINS_BY_DAO = 'PLUGINS_BY_DAO',
}

export const daoServiceKeys = {
    dao: (params: IGetDaoParams) => [DaoServiceKey.DAO, params],
    daoByEns: (params: IGetDaoByEnsParams) => [DaoServiceKey.DAO_BY_ENS, params],
    pluginsByDao: (params: IGetPluginsByDaoParams) => [DaoServiceKey.PLUGINS_BY_DAO, params],
};
