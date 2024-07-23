import type {
    IGetMemberListParams,
    IGetMemberParams,
    IGetProposalListParams,
    IGetProposalParams,
} from './governanceService.api';

export enum GovernanceServiceKey {
    PROPOSAL_LIST = 'PROPOSAL_LIST',
    PROPOSAL = 'PROPOSAL',
    MEMBER_LIST = 'MEMBER_LIST',
    MEMBER = 'MEMBER',
}

export const governanceServiceKeys = {
    proposalList: (params: IGetProposalListParams) => [GovernanceServiceKey.PROPOSAL_LIST, params],
    proposal: (params: IGetProposalParams) => [GovernanceServiceKey.PROPOSAL, params],
    memberList: (params: IGetMemberListParams) => [GovernanceServiceKey.MEMBER_LIST, params],
    member: (params: IGetMemberParams) => [GovernanceServiceKey.MEMBER, params],
};
