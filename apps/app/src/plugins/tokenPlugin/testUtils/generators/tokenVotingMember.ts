import type { TokenVotingMemberDTO } from '@aragon/aragon-domain';

export const generateTokenVotingMember = (
    member?: Partial<TokenVotingMemberDTO>,
): TokenVotingMemberDTO => ({
    address: '0x0000000000000000000000000000000000000000',
    ens: null,
    votingPower: '0',
    metrics: {
        firstActivityTimestamp: null,
        lastActivityTimestamp: null,
        delegationCount: 0,
    },
    ...member,
});
