import type { IGetDaoListParams } from './daoExplorerService.api';

export enum DaoExplorerServiceKey {
    DAO_LIST = 'DAO_LIST',
    DAO_LIST_BY_MEMBER_ADDRESS = 'DAO_LIST_BY_MEMBER',
}

export const daoExplorerServiceKeys = {
    daoList: (params: IGetDaoListParams) => [DaoExplorerServiceKey.DAO_LIST, params],
};
