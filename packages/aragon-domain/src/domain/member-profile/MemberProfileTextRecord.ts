import { ValueObject } from 'ddd-core-ts';
import { z } from 'zod';

const MemberProfileTextRecordPropsSchema = z.object({
  key: z.string().min(1, 'key must not be empty'),
  value: z.string(),
});

type MemberProfileTextRecordProps = z.output<
  typeof MemberProfileTextRecordPropsSchema
>;

/**
 * A single forward text record on a member's subdomain — for example
 * `{ key: 'avatar', value: 'ipfs://…' }`.
 */
export class MemberProfileTextRecord extends ValueObject<MemberProfileTextRecordProps> {
  get key(): string {
    return this.props.key;
  }

  get value(): string {
    return this.props.value;
  }

  static create(props: MemberProfileTextRecordProps): MemberProfileTextRecord {
    const validated = MemberProfileTextRecordPropsSchema.parse(props);
    return new MemberProfileTextRecord(validated);
  }
}
