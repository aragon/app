import { ValueObject } from 'ddd-core-ts';
import { z } from 'zod';
import { ENSName } from '@/domain/ens/ENSName';
import { type Address, earliest, latest } from '@/domain/primitives';
import type { VotingPower } from '@/domain/voting-power/VotingPower';
import { MemberGovernanceActivity } from './MemberGovernanceActivity';
import { TokenVotingMemberRecord } from './TokenVotingMemberRecord';

const TokenVotingMemberPropsSchema = z.object({
  record: z.instanceof(TokenVotingMemberRecord),
  activity: z.instanceof(MemberGovernanceActivity).nullable(),
  ens: z.instanceof(ENSName).nullable(),
});

type TokenVotingMemberProps = z.infer<typeof TokenVotingMemberPropsSchema>;

/**
 * A member of a TokenVoting plugin.
 */
export class TokenVotingMember extends ValueObject<TokenVotingMemberProps> {
  /**
   * The member's account address.
   */
  get address(): Address {
    return this.props.record.address;
  }

  /**
   * The member's primary ENS name, or null when the address has no
   * primary name (or it could not be resolved).
   */
  get ens(): ENSName | null {
    return this.props.ens;
  }

  /**
   * The member's voting power.
   */
  get votingPower(): VotingPower {
    return this.props.record.votingPower;
  }

  /**
   * Number of distinct accounts currently delegating their voting power
   * to this member (counts self-delegation).
   */
  get delegationCount(): number {
    return this.props.record.delegationCount;
  }

  /**
   * Timestamp of the member's first observed activity. "Activity"
   * includes voting power changes, votes cast, and proposals created.
   * Null when no activity has been recorded.
   */
  get firstActivityTimestamp(): Date | null {
    return earliest([
      this.props.activity?.firstGovernanceActivityTimestamp,
      this.props.record.firstVotingPowerChangeTimestamp,
    ]);
  }

  /**
   * Timestamp of the member's most recent observed activity. "Activity"
   * includes voting power changes, votes cast, and proposals created.
   * Null when no activity has been recorded.
   */
  get lastActivityTimestamp(): Date | null {
    return latest([
      this.props.activity?.lastGovernanceActivityTimestamp,
      this.props.record.lastVotingPowerChangeTimestamp,
    ]);
  }

  static create(
    record: TokenVotingMemberRecord,
    activity: MemberGovernanceActivity | null,
    ens: ENSName | null,
  ): TokenVotingMember {
    const validated = TokenVotingMemberPropsSchema.parse({
      record,
      activity,
      ens,
    });
    return new TokenVotingMember(validated);
  }
}
