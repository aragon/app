import type { TokenVotingMemberDTO } from '@aragon/aragon-domain';
import type { ITokenMember } from '@/plugins/tokenPlugin/types';

/**
 * Anti-corruption boundary: Maps a legacy backend token member into the
 * aragon-domain `TokenVotingMemberDTO` that the token list renders from.
 *
 * The legacy backend reports activity as block numbers, which cannot be
 * resolved to the DTO's activity timestamps without per-member RPC
 * lookups. The mapper emits `null` until the UI actually needs pre-migration
 * activity data. Nothing renders the list timestamps today.
 *
 * This survives until the legacy backend list path is retired.
 */
export const mapBackendMemberToTokenVotingDTO = (
    member: ITokenMember,
): TokenVotingMemberDTO => ({
    address: member.address,
    ens: member.ens,
    votingPower: member.votingPower,
    firstActivityTimestamp: null,
    lastActivityTimestamp: null,
    delegationCount: member.metrics.delegationCount,
});
