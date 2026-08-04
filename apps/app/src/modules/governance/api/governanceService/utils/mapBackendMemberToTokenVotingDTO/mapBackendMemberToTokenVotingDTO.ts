import type { TokenVotingMemberDTO } from '@aragon/aragon-domain';
import type { ITokenMember } from '@/plugins/tokenPlugin/types';

/**
 * Anti-corruption boundary: Maps a legacy backend token member into the
 * aragon-domain `TokenVotingMemberDTO` that the token list renders from.
 *
 * This survives until the legacy backend list path is retired.
 */
export const mapBackendMemberToTokenVotingDTO = (
    member: ITokenMember,
): TokenVotingMemberDTO => ({
    address: member.address,
    ens: member.ens,
    votingPower: member.votingPower,
    metrics: {
        firstActivityTimestamp: member.metrics.firstActivityTimestamp,
        lastActivityTimestamp: member.metrics.lastActivityTimestamp,
        delegationCount: member.metrics.delegationCount,
    },
});
