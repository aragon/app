import type { IGetDaoListParams } from './daoExplorerService.api';

export enum DaoExplorerServiceKey {
    DAO_LIST = 'DAO_LIST',
}

export const daoExplorerServiceKeys = {
    daoList: (params: IGetDaoListParams) => [DaoExplorerServiceKey.DAO_LIST, params],
};
