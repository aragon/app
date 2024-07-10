import type { IPaginatedRequest, IRequestQueryParams } from '@/shared/api/aragonBackendService';

export interface IGetMemberListQueryParams extends IPaginatedRequest {
    /**
     * ID of the Dao to fetch the members from.
     */
    daoId: string;
}

export interface IGetMemberListParams extends IRequestQueryParams<IGetMemberListQueryParams> {}

export interface IGetProposalListQueryParams extends IPaginatedRequest {
    /**
     * ID of the Dao to fetch the proposals from.
     */
    daoId: string;
}

export interface IGetProposalListParams extends IRequestQueryParams<IGetProposalListQueryParams> {}
