import type { IPaginatedRequest } from '@/shared/api/aragonBackendService';
import type { IRequestQueryParams, IRequestUrlParams, IRequestUrlQueryParams } from '@/shared/api/httpService';

export interface IGetProposalListQueryParams extends IPaginatedRequest {
    /**
     * ID of the Dao to fetch the proposals from.
     */
    daoId: string;
    /**
     * Filter proposals by creator address.
     */
    creatorAddress?: string;
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

export interface IGetProposalUrlParams {
    /**
     * ID of the proposal to fetch.
     */
    id: string;
}

export interface IGetProposalParams extends IRequestUrlParams<IGetProposalUrlParams> {}

export interface IGetVoteListQueryParams extends IPaginatedRequest {
    /**
     * ID of the proposal to fetch the votes for.
     */
    proposalId?: string;
    /**
     * ID of the DAO to fetch the votes from.
     */
    daoId?: string;
    /**
     * Address of the member to fetch the votes for.
     */
    address?: string;
    /**
     * Option to show extra proposal information.
     */
    includeInfo?: boolean;
}

export interface IGetVoteListParams extends IRequestQueryParams<IGetVoteListQueryParams> {}
