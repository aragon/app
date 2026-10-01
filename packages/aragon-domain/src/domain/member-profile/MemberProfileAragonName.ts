import { ValueObject } from 'ddd-core-ts';
import { normalize as ensNormalize } from 'viem/ens';
import { z } from 'zod';

const PARENT_DOMAIN = 'aragon.eth';
const PARENT_SUFFIX = `.${PARENT_DOMAIN}` as const;

/**
 * Normalizes a raw name input to its ENSIP-15 canonical form.
 *
 * Surrounding whitespace is trimmed before normalization as a form-input
 * convenience — `viem.normalize` itself treats whitespace as a disallowed
 * character. Everything downstream (case folding, NFC composition, banned
 * characters, confusable scripts, ZWJ/emoji rules) is delegated to viem's
 * ENSIP-15 implementation.
 */
function canonicalize(input: string): string {
  return ensNormalize(input.trim());
}

const MemberProfileAragonNamePropsSchema = z
  .object({
    value: z.string().min(1, 'name must not be empty'),
  })
  .transform(({ value }) => ({ value: canonicalize(value) }))
  .refine(
    (props) => props.value.endsWith(PARENT_SUFFIX),
    `name must end with ${PARENT_SUFFIX}`,
  )
  .refine((props) => {
    const label = props.value.slice(0, -PARENT_SUFFIX.length);
    return label.length > 0;
  }, 'name must include at least one label before .aragon.eth');

type MemberProfileAragonNameProps = z.output<
  typeof MemberProfileAragonNamePropsSchema
>;
type MemberProfileAragonNameInput = z.input<
  typeof MemberProfileAragonNamePropsSchema
>;

/**
 * Subdomain of `aragon.eth` issued by an ENS `MemberRegistry`.
 */
export class MemberProfileAragonName extends ValueObject<MemberProfileAragonNameProps> {
  toString(): string {
    return this.props.value;
  }

  static create(props: MemberProfileAragonNameInput): MemberProfileAragonName {
    const validated = MemberProfileAragonNamePropsSchema.parse(props);
    return new MemberProfileAragonName(validated);
  }

  static fromString(input: string): MemberProfileAragonName {
    return MemberProfileAragonName.create({ value: input });
  }
}
