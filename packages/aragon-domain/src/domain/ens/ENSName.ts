import { ValueObject } from 'ddd-core-ts';
import { normalize as ensNormalize } from 'viem/ens';
import { z } from 'zod';

/**
 * Normalizes a raw ENS name to its ENSIP-15 canonical form.
 */
function canonicalize(input: string): string {
  return ensNormalize(input.trim());
}

const ENSNamePropsSchema = z
  .object({
    value: z.string().min(1, 'name must not be empty'),
  })
  .transform(({ value }) => ({ value: canonicalize(value) }));

type ENSNameProps = z.output<typeof ENSNamePropsSchema>;
type ENSNameInput = z.input<typeof ENSNamePropsSchema>;

/**
 * A normalized ENS name — e.g. a primary name obtained via reverse
 * resolution. Stored in its ENSIP-15 canonical form so that equal names
 * compare equal and any downstream hashing/display stays consistent.
 *
 * `create` throws if the input is not a valid ENS name.
 */
export class ENSName extends ValueObject<ENSNameProps> {
  toString(): string {
    return this.props.value;
  }

  static create(props: ENSNameInput): ENSName {
    const validated = ENSNamePropsSchema.parse(props);
    return new ENSName(validated);
  }

  static fromString(input: string): ENSName {
    return ENSName.create({ value: input });
  }
}
