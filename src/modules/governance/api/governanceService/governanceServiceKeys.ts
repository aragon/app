import type {
    IGetIsDaoMemberParams,
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
    IS_DAO_MEMBER = 'IS_DAO_MEMBER',
    VOTE_LIST = 'VOTE_LIST',
}

export const governanceServiceKeys = {
    proposalList: (params: IGetProposalListParams) => [GovernanceServiceKey.PROPOSAL_LIST, params],
    proposal: (params: IGetProposalParams) => [GovernanceServiceKey.PROPOSAL, params],
    memberList: (params: IGetMemberListParams) => [GovernanceServiceKey.MEMBER_LIST, params],
    member: (params: IGetMemberParams) => [GovernanceServiceKey.MEMBER, params],
    isDaoMember: (params: IGetIsDaoMemberParams) => [GovernanceServiceKey.IS_DAO_MEMBER, params],
    voteList: (params: IGetVoteListParams) => [GovernanceServiceKey.VOTE_LIST, params],
};
