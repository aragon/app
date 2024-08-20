import type {
    IOrderedRequest,
    IPaginatedRequest,
    IRequestQueryParams,
    IRequestUrlQueryParams,
} from '@/shared/api/aragonBackendService';

export interface IGetDaoListQueryParams extends IPaginatedRequest, IOrderedRequest {}

export interface IGetDaoListParams extends IRequestQueryParams<IGetDaoListQueryParams> {}

export interface IGetDaoListByMemberUrlParams {
    /**
     * Address of the member to fetch the DAOs for
     */
    address: string;
}

export interface IGetDaoListByMemberQueryParams extends IPaginatedRequest, IOrderedRequest {}

export interface IGetDaoListByMemberAddressParams
    extends IRequestUrlQueryParams<IGetDaoListByMemberUrlParams, IGetDaoListByMemberQueryParams> {}
