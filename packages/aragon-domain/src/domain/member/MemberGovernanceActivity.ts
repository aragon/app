import { ValueObject } from 'ddd-core-ts';
import { z } from 'zod';
import { Address } from '@/domain/primitives';

const MemberGovernanceActivityPropsSchema = z.object({
  memberAddress: z.instanceof(Address),
  firstGovernanceActivityTimestamp: z.date().nullable(),
  lastGovernanceActivityTimestamp: z.date().nullable(),
});

type MemberGovernanceActivityProps = z.infer<
  typeof MemberGovernanceActivityPropsSchema
>;

/**
 * A member's governance activity (votes cast or proposals created) within a
 * plugin.
 */
export class MemberGovernanceActivity extends ValueObject<MemberGovernanceActivityProps> {
  /**
   * The member's account address.
   */
  get memberAddress(): Address {
    return this.props.memberAddress;
  }

  /**
   * Timestamp of the member's first governance action, or null when no
   * such action has been recorded.
   */
  get firstGovernanceActivityTimestamp(): Date | null {
    return this.props.firstGovernanceActivityTimestamp;
  }

  /**
   * Timestamp of the member's most recent governance action, or null
   * when no such action has been recorded.
   */
  get lastGovernanceActivityTimestamp(): Date | null {
    return this.props.lastGovernanceActivityTimestamp;
  }

  static create(
    props: MemberGovernanceActivityProps,
  ): MemberGovernanceActivity {
    const validated = MemberGovernanceActivityPropsSchema.parse(props);
    return new MemberGovernanceActivity(validated);
  }
}
