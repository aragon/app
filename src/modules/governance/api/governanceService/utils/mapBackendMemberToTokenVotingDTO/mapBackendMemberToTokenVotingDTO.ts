import type { TokenVotingMemberDTO } from '@aragon/aragon-subdomain';
import type { ITokenMember } from '@/plugins/tokenPlugin/types';

/**
 * Anti-corruption boundary: maps a legacy backend token member into the
 * library-owned `TokenVotingMemberDTO` that the token list renders from.
 *
 * The block-number `type` / `firstActive` / `lastActive` fields are dropped —
 * they are not part of the list DTO. `address`, `ens`, `votingPower` and the
 * `metrics` (including `delegationCount`) pass through unchanged.
 *
 * This survives until the legacy backend list path is retired; the subdomain
 * branch returns the DTO directly and needs no mapper.
 */
export const mapBackendMemberToTokenVotingDTO = (
    member: ITokenMember,
): TokenVotingMemberDTO => ({
    address: member.address,
    ens: null,
    votingPower: member.votingPower,
    metrics: {
        firstActivityTimestamp: member.metrics.firstActivityTimestamp,
        lastActivityTimestamp: member.metrics.lastActivityTimestamp,
        delegationCount: member.metrics.delegationCount,
    },
});
