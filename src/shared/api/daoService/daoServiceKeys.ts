import type { IGetDaoListByMemberAddressParams, IGetDaoParams, IGetDaoSettingsParams } from './daoService.api';

export enum DaoServiceKey {
    DAO = 'DAO',
    DAO_SETTINGS = 'DAO_SETTINGS',
    DAO_LIST_BY_MEMBER_ADDRESS = 'DAO_LIST_BY_MEMBER_ADDRESS',
}

export const daoServiceKeys = {
    dao: (params: IGetDaoParams) => [DaoServiceKey.DAO, params],
    daoSettings: (params: IGetDaoSettingsParams) => [DaoServiceKey.DAO_SETTINGS, params],
    daoListByMemberAddress: (params: IGetDaoListByMemberAddressParams) => [
        DaoServiceKey.DAO_LIST_BY_MEMBER_ADDRESS,
        params,
    ],
};
