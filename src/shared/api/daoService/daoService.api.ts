import type {
    IOrderedRequest,
    IPaginatedRequest,
    IRequestQueryParams,
    IRequestUrlParams,
} from '../aragonBackendService';

export interface IGetDaoUrlParams {
    /**
     * ID of the DAO to be fetched.
     */
    id: string;
}

export interface IGetDaoParams extends IRequestUrlParams<IGetDaoUrlParams> {}

export interface IGetDaoSettingsUrlParams {
    /**
     * ID of the DAO to fetch the settings for.
     */
    daoId: string;
}

export interface IGetDaoSettingsParams extends IRequestUrlParams<IGetDaoSettingsUrlParams> {}

export interface IGetDaoListByMemberQueryParams extends IPaginatedRequest, IOrderedRequest {
    address: string;
}

export interface IGetDaoListByMemberAddressParams extends IRequestUrlParams<IGetDaoListByMemberQueryParams> {}

export interface IGetProposalListByMemberQueryParams extends IPaginatedRequest, IOrderedRequest {
    /**
     * Address of the member to fetch the proposals for.
     */
    creatorAddress: string;
    /**
     * ID of the DAO to fetch the proposals for.
     */
    daoId: string;
}

export interface IGetProposalListByMemberAddressParams
    extends IRequestQueryParams<IGetProposalListByMemberQueryParams> {}
