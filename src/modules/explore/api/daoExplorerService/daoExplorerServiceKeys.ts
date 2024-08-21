import type { IGetDaoListByMemberAddressParams, IGetDaoListParams } from './daoExplorerService.api';

export enum DaoExplorerServiceKey {
    DAO_LIST = 'DAO_LIST',
    DAO_LIST_BY_MEMBER_ADDRESS = 'DAO_LIST_BY_MEMBER_ADDRESS',
}

export const daoExplorerServiceKeys = {
    daoList: (params: IGetDaoListParams) => [DaoExplorerServiceKey.DAO_LIST, params],
    daoListByMemberAddress: (params: IGetDaoListByMemberAddressParams) => [
        DaoExplorerServiceKey.DAO_LIST_BY_MEMBER_ADDRESS,
        params,
    ],
};
