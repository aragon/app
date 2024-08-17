import type { IGetDaoParams, IGetDaoSettingsParams, IGetProposalListByMemberAddressParams } from './daoService.api';

export enum DaoServiceKey {
    DAO = 'DAO',
    DAO_SETTINGS = 'DAO_SETTINGS',
    PROPOSAL_LIST_BY_MEMBER_ADDRESS = 'PROPOSAL_LIST_BY_MEMBER_ADDRESS',
}

export const daoServiceKeys = {
    dao: (params: IGetDaoParams) => [DaoServiceKey.DAO, params],
    daoSettings: (params: IGetDaoSettingsParams) => [DaoServiceKey.DAO_SETTINGS, params],
    proposalListByMemberAddress: (params: IGetProposalListByMemberAddressParams) => [
        DaoServiceKey.PROPOSAL_LIST_BY_MEMBER_ADDRESS,
        params,
    ],
};
