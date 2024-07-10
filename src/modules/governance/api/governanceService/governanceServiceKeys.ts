import type { IGetMemberListParams, IGetProposalListParams } from './governanceService.api';

export enum GovernanceServiceKey {
    MEMBER_LIST = 'MEMBER_LIST',
    PROPOSAL_LIST = 'PROPOSAL_LIST',
}

export const governanceServiceKeys = {
    memberList: (params: IGetMemberListParams) => [GovernanceServiceKey.MEMBER_LIST, params],
    proposalList: (params: IGetProposalListParams) => [GovernanceServiceKey.PROPOSAL_LIST, params],
};
