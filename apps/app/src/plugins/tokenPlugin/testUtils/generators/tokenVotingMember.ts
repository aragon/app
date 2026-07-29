import type { TokenVotingMemberDTO } from '@aragon/aragon-domain';

/**
 * Builds a `TokenVotingMemberDTO` — the shape the token member list renders
 * from. Use this for member-list tests; use `generateTokenMember`
 * (`ITokenMember`) for single-member tests.
 */
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
