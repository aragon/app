import type { IGetMemberListParams, IGetMemberParams, IGetProposalListParams } from './governanceService.api';

export enum GovernanceServiceKey {
    PROPOSAL_LIST = 'PROPOSAL_LIST',
    MEMBER_LIST = 'MEMBER_LIST',
    MEMBER = 'MEMBER',
}

export const governanceServiceKeys = {
    memberList: (params: IGetMemberListParams) => [GovernanceServiceKey.MEMBER_LIST, params],
    proposalList: (params: IGetProposalListParams) => [GovernanceServiceKey.PROPOSAL_LIST, params],
    member: (params: IGetMemberParams) => [GovernanceServiceKey.MEMBER, params],
};
