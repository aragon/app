import type { TokenVotingMember } from '@/domain/member/TokenVotingMember';

/**
 * A member of a TokenVoting plugin.
 */
export interface TokenVotingMemberDTO {
  /**
   * The member's account address, EIP-55 checksummed.
   */
  address: string;

  /**
   * The member's primary ENS name, or null when the address has no
   * primary name (or it could not be resolved).
   */
  ens: string | null;

  /**
   * The member's current voting power in wei, as a decimal string. Always
   * set for indexed members; nullable so consumers can carry members from
   * sources that do not report a voting power through the same DTO.
   */
  votingPower: string | null;

  /**
   * ISO 8601 timestamp of the member's first observed activity.
   * "Activity" includes voting power changes, votes cast, and proposals
   * created. Null when no activity has been recorded.
   */
  firstActivityTimestamp: string | null;

  /**
   * ISO 8601 timestamp of the member's most recent observed activity.
   * "Activity" includes voting power changes, votes cast, and proposals
   * created. Null when no activity has been recorded.
   */
  lastActivityTimestamp: string | null;

  /**
   * Number of distinct accounts currently delegating their voting power
   * to this member (counts self-delegation).
   */
  delegationCount: number;
}

export function mapDomainToDTO(
  member: TokenVotingMember,
): TokenVotingMemberDTO {
  return {
    address: member.address.toHexString(),
    ens: member.ens ? member.ens.toString() : null,
    votingPower: member.votingPower.toWei().toBigNumber().toFixed(0),
    firstActivityTimestamp:
      member.firstActivityTimestamp?.toISOString() ?? null,
    lastActivityTimestamp: member.lastActivityTimestamp?.toISOString() ?? null,
    delegationCount: member.delegationCount,
  };
}
