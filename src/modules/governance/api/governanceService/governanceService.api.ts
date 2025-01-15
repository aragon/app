import type { IPaginatedRequest } from '@/shared/api/aragonBackendService';
import type { IRequestQueryParams, IRequestUrlParams, IRequestUrlQueryParams } from '@/shared/api/httpService';

export interface IGetProposalListQueryParams extends IPaginatedRequest {
    /**
     * ID of the Dao to fetch the proposals from.
     */
    daoId: string;
    /**
     * Address of the plugin to fetch the proposals for.
     */
    pluginAddress: string;
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
    /**
     * Address of the plugin to fetch the members for.
     */
    pluginAddress: string;
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
    /**
     * Address of the plugin used to include the member stats.
     */
    pluginAddress?: string;
}

export interface IGetMemberParams extends IRequestUrlQueryParams<IGetMemberUrlParams, IGetMemberQueryParams> {}

export interface IGetMemberExistsUrlParams {
    /**
     * Address of the member to query a plugin for.
     */
    memberAddress: string;
    /**
     * Address of the plugin to check the member for.
     */
    pluginAddress: string;
}

export interface IGetMemberExistsParams extends IRequestUrlParams<IGetMemberExistsUrlParams> {}

export interface IGetProposalUrlParams {
    /**
     * ID of the proposal to fetch.
     */
    id: string;
}

export interface IGetProposalParams extends IRequestUrlParams<IGetProposalUrlParams> {}

export interface IGetCanVoteUrlParams {
    /**
     * ID of the proposal to check voting permissions for.
     */
    id: string;
}

export interface IGetCanVoteQueryParams {
    /**
     * Address of the connected user to check voting permissions for.
     */
    userAddress: string;
}

export interface IGetCanVoteParams extends IRequestUrlQueryParams<IGetCanVoteUrlParams, IGetCanVoteQueryParams> {}

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
    /**
     * Option to show extra parent proposal information.
     */
    includeParentInfo?: boolean;
    /**
     * Plugin address to fetch the votes from.
     */
    pluginAddress: string;
    /**
     * If voted, show a specific address result first in the list.
     */
    highlightUser?: string;
}

export interface IGetVoteListParams extends IRequestQueryParams<IGetVoteListQueryParams> {}
