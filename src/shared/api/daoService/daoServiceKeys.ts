import type { IGetDaoByEnsParams, IGetDaoParams } from './daoService.api';

export enum DaoServiceKey {
    DAO = 'DAO',
    DAO_BY_ENS = 'DAO_BY_ENS',
}

export const daoServiceKeys = {
    dao: (params: IGetDaoParams) => [DaoServiceKey.DAO, params],
    daoByEns: (params: IGetDaoByEnsParams) => [DaoServiceKey.DAO_BY_ENS, params],
};
