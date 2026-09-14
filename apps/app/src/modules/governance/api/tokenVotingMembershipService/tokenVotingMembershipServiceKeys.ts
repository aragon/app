import type { IGetTokenVotingMembershipParams } from './tokenVotingMembershipService.api';

export enum TokenVotingMembershipServiceKey {
    MEMBERSHIP = 'MEMBERSHIP',
}

export const tokenVotingMembershipServiceKeys = {
    membership: (params: IGetTokenVotingMembershipParams) => [
        TokenVotingMembershipServiceKey.MEMBERSHIP,
        params,
    ],
};
