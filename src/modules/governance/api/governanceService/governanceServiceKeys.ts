import type {
    IGetMemberExistsParams,
    IGetMemberListParams,
    IGetMemberParams,
    IGetProposalListParams,
    IGetProposalParams,
    IGetVoteListParams,
} from './governanceService.api';

export enum GovernanceServiceKey {
    PROPOSAL_LIST = 'PROPOSAL_LIST',
    PROPOSAL = 'PROPOSAL',
    MEMBER_LIST = 'MEMBER_LIST',
    MEMBER = 'MEMBER',
    MEMBER_EXISTS = 'MEMBER_EXISTS',
    VOTE_LIST = 'VOTE_LIST',
}

export const governanceServiceKeys = {
    proposalList: (params: IGetProposalListParams) => [GovernanceServiceKey.PROPOSAL_LIST, params],
    proposal: (params: IGetProposalParams) => [GovernanceServiceKey.PROPOSAL, params],
    memberList: (params: IGetMemberListParams) => [GovernanceServiceKey.MEMBER_LIST, params],
    member: (params: IGetMemberParams) => [GovernanceServiceKey.MEMBER, params],
    memberExists: (params: IGetMemberExistsParams) => [GovernanceServiceKey.MEMBER_EXISTS, params],
    voteList: (params: IGetVoteListParams) => [GovernanceServiceKey.VOTE_LIST, params],
};
