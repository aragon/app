import type { IGetMemberListParams } from './governanceService.api';

export enum GovernanceServiceKey {
    MEMBER_LIST = 'MEMBER_LIST',
}

export const governanceServiceKeys = {
    memberList: (params: IGetMemberListParams) => [GovernanceServiceKey.MEMBER_LIST, params],
};
