import { ValueObject } from 'ddd-core-ts';
import { z } from 'zod';
import { Address } from '@/domain/primitives';
import { VotingPower } from '@/domain/voting-power/VotingPower';

const TokenVotingMemberRecordPropsSchema = z.object({
  address: z.instanceof(Address),
  votingPower: z.instanceof(VotingPower),
  delegationCount: z.number().int().nonnegative(),
  firstVotingPowerChangeTimestamp: z.date().nullable(),
  lastVotingPowerChangeTimestamp: z.date().nullable(),
});

type TokenVotingMemberRecordProps = z.infer<
  typeof TokenVotingMemberRecordPropsSchema
>;

/**
 * A TokenVoting member as derived purely from on-chain
 * delegate state: their voting power, delegation count, and the window
 * of their voting-power changes.
 */
export class TokenVotingMemberRecord extends ValueObject<TokenVotingMemberRecordProps> {
  /**
   * The member's account address.
   */
  get address(): Address {
    return this.props.address;
  }

  /**
   * The member's current voting power.
   */
  get votingPower(): VotingPower {
    return this.props.votingPower;
  }

  /**
   * Number of distinct accounts delegating their voting power to this
   * member (counts self-delegation).
   */
  get delegationCount(): number {
    return this.props.delegationCount;
  }

  /**
   * Timestamp of the member's first voting-power change, or null when
   * no such change has been observed.
   */
  get firstVotingPowerChangeTimestamp(): Date | null {
    return this.props.firstVotingPowerChangeTimestamp;
  }

  /**
   * Timestamp of the member's most recent voting-power change, or null
   * when no such change has been observed.
   */
  get lastVotingPowerChangeTimestamp(): Date | null {
    return this.props.lastVotingPowerChangeTimestamp;
  }

  static create(props: TokenVotingMemberRecordProps): TokenVotingMemberRecord {
    const validated = TokenVotingMemberRecordPropsSchema.parse(props);
    return new TokenVotingMemberRecord(validated);
  }
}
