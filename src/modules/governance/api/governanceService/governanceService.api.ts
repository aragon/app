import type { IProposal } from '@/modules/governance/api/governanceService/domain';
import type {
    IPaginatedRequest,
    IRequestQueryParams,
    IRequestUrlParams,
    IRequestUrlQueryParams,
} from '@/shared/api/aragonBackendService';
import type { IProposalAction } from '@aragon/ods';

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
}

export interface IGetVoteListParams extends IRequestQueryParams<IGetVoteListQueryParams> {}

export interface INormalizeActionsParams {
    /**
     * List of plugins for the DAO.
     */
    plugins: string[];
    /**
     * List of fetched actions in the proposal.
     */
    actions: IProposalAction[];
    /**
     * The proposal object with full data.
     */
    proposal: IProposal;
    /**
     * The DAO ID.
     */
    daoId: string;
}
