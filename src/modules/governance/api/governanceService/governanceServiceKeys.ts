import type {
    IGetCanCreateProposalParams,
    IGetCanVoteParams,
    IGetMemberExistsParams,
    IGetMemberListParams,
    IGetMemberParams,
    IGetProposalActionsParams,
    IGetProposalBySlugParams,
    IGetProposalListParams,
    IGetVoteListParams,
} from './governanceService.api';

export enum GovernanceServiceKey {
    PROPOSAL_LIST = 'PROPOSAL_LIST',
    PROPOSAL_BY_SLUG = 'PROPOSAL_BY_SLUG',
    PROPOSAL_ACTIONS = 'PROPOSAL_ACTIONS',
    CAN_VOTE = 'CAN_VOTE',
    CAN_CREATE_PROPOSAL = 'CAN_CREATE_PROPOSAL',
    MEMBER_LIST = 'MEMBER_LIST',
    MEMBER = 'MEMBER',
    MEMBER_EXISTS = 'MEMBER_EXISTS',
    VOTE_LIST = 'VOTE_LIST',
}

export const governanceServiceKeys = {
    proposalList: (params: IGetProposalListParams) => [GovernanceServiceKey.PROPOSAL_LIST, params],
    proposalBySlug: (params: IGetProposalBySlugParams) => [GovernanceServiceKey.PROPOSAL_BY_SLUG, params],
    proposalActions: (params: IGetProposalActionsParams) => [GovernanceServiceKey.PROPOSAL_ACTIONS, params],
    canVote: (params: IGetCanVoteParams) => [GovernanceServiceKey.CAN_VOTE, params],
    canCreateProposal: (params: IGetCanCreateProposalParams) => [GovernanceServiceKey.CAN_CREATE_PROPOSAL, params],
    memberList: (params: IGetMemberListParams) => [GovernanceServiceKey.MEMBER_LIST, params],
    member: (params: IGetMemberParams) => [GovernanceServiceKey.MEMBER, params],
    memberExists: (params: IGetMemberExistsParams) => [GovernanceServiceKey.MEMBER_EXISTS, params],
    voteList: (params: IGetVoteListParams) => [GovernanceServiceKey.VOTE_LIST, params],
};
