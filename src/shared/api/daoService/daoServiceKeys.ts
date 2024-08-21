import type { IGetDaoParams, IGetDaoSettingsParams } from './daoService.api';

export enum DaoServiceKey {
    DAO = 'DAO',
    DAO_SETTINGS = 'DAO_SETTINGS',
}

export const daoServiceKeys = {
    dao: (params: IGetDaoParams) => [DaoServiceKey.DAO, params],
    daoSettings: (params: IGetDaoSettingsParams) => [DaoServiceKey.DAO_SETTINGS, params],
};
