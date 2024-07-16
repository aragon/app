import type { IPaginatedRequest, IRequestQueryParams, IRequestUrlQueryParams } from '@/shared/api/aragonBackendService';

export interface IGetProposalListQueryParams extends IPaginatedRequest {
    /**
     * ID of the Dao to fetch the proposals from.
     */
    daoId: string;
}

export interface IGetProposalListParams extends IRequestQueryParams<IGetProposalListQueryParams> {}

export interface IGetMemberListQueryParams extends IPaginatedRequest {
    /**
     * ID of the DAO to fetch the members from.
     */
    daoId: string;
}

export interface IGetMemberListParams extends IRequestQueryParams<IGetMemberListQueryParams> {}

export interface IGetMemberUrlParams {
    /**
     * Address of a DAO member.
     */
    address: string;
}

export interface IGetMemberQueryParams {
    /**
     * ID of the DAO to fetch the member from.
     */
    daoId: string;
}
export interface IGetMemberParams extends IRequestUrlQueryParams<IGetMemberUrlParams, IGetMemberQueryParams> {}
