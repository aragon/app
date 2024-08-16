import type {
    IOrderedRequest,
    IPaginatedRequest,
    IRequestUrlParams,
    IRequestUrlQueryParams,
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

export interface IGetDaoListByMemberUrlParams extends IPaginatedRequest, IOrderedRequest {
    /**
     * Address of the member to fetch the DAOs for
     */
    address: string;
}

export interface IGetDaoListByMemberQueryParams extends IPaginatedRequest, IOrderedRequest {}

export interface IGetDaoListByMemberAddressParams
    extends IRequestUrlQueryParams<IGetDaoListByMemberUrlParams, IGetDaoListByMemberQueryParams> {}
