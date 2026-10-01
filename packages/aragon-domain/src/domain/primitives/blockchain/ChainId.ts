import { ValueObject } from 'ddd-core-ts';
import { z } from 'zod';

const ChainIdPropsSchema = z.object({
  chainIdValue: z.number().int().positive(),
});

type ChainIdProps = z.infer<typeof ChainIdPropsSchema>;

/**
 * An EIP-155 chain id. Validates the generic shape (a positive integer)
 * only; which chains are actually supported is a configuration concern of
 * the consumer, not of this value object.
 */
export class ChainId extends ValueObject<ChainIdProps> {
  public toNumber(): number {
    return this.props.chainIdValue;
  }

  public equals(other: ChainId): boolean {
    return this.toNumber() === other.toNumber();
  }

  public static create(props: ChainIdProps): ChainId {
    const validatedProps = ChainIdPropsSchema.parse(props);
    return new ChainId(validatedProps);
  }

  /**
   * Creates a ChainId from its numeric EIP-155 value.
   */
  public static fromNumber(chainId: number): ChainId {
    return ChainId.create({ chainIdValue: chainId });
  }
}
