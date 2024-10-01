import type { IGetDaoParams } from './daoService.api';

export enum DaoServiceKey {
    DAO = 'DAO',
}

export const daoServiceKeys = {
    dao: (params: IGetDaoParams) => [DaoServiceKey.DAO, params],
};
