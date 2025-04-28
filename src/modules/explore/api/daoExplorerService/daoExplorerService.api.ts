import type { IOrderedRequest, IPaginatedRequest, ISearchedRequest } from '@/shared/api/aragonBackendService';
import type { Network } from '@/shared/api/daoService';
import type { IRequestQueryParams, IRequestUrlQueryParams } from '@/shared/api/httpService';

export interface IGetDaoListQueryParams extends IPaginatedRequest, IOrderedRequest, ISearchedRequest {
    /**
     * List of networks to filter the DAOs by.
     */
    networks?: Network[];
}

export interface IGetDaoListParams extends IRequestQueryParams<IGetDaoListQueryParams> {}

export interface IGetDaoListByMemberUrlParams {
    /**
     * Address of the member to fetch the DAOs for
     */
    address: string;
}

export interface IGetDaoListByMemberQueryParams extends IPaginatedRequest, IOrderedRequest, ISearchedRequest {
    /**
     * DAO ID to filter out from the list
     */
    excludeDaoId?: string;
}

export interface IGetDaoListByMemberAddressParams
    extends IRequestUrlQueryParams<IGetDaoListByMemberUrlParams, IGetDaoListByMemberQueryParams> {}
