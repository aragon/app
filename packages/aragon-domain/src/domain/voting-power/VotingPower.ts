import BigNumber from 'bignumber.js';
import { ValueObject } from 'ddd-core-ts';
import { z } from 'zod';
import { Wei } from '@/domain/primitives';

const VotingPowerPropsSchema = z.object({
  weiValue: z
    .instanceof(Wei)
    .refine(
      (wei) => !wei.toBigNumber().isNegative(),
      'weiValue must be non-negative',
    ),
});

type VotingPowerProps = z.infer<typeof VotingPowerPropsSchema>;

/**
 * A non-negative amount of voting power, held in wei.
 */
export class VotingPower extends ValueObject<VotingPowerProps> {
  /**
   * The voting power in wei.
   */
  toWei(): Wei {
    return this.props.weiValue;
  }

  /**
   * Whether this voting power is zero.
   */
  get isZero(): boolean {
    return this.props.weiValue.toBigNumber().isZero();
  }

  /**
   * True if the internal wei value is equal to the other's.
   */
  equals(other?: VotingPower): boolean {
    if (!other) {
      return false;
    }
    return this.props.weiValue.equals(other.toWei());
  }

  static create(weiValue: Wei): VotingPower {
    const validated = VotingPowerPropsSchema.parse({ weiValue });
    return new VotingPower(validated);
  }

  /**
   * Creates a VotingPower from a bigint value in wei.
   */
  static fromBigInt(wei: bigint): VotingPower {
    return VotingPower.create(Wei.create(new BigNumber(wei.toString())));
  }

  /**
   * Creates a zero voting power.
   */
  static zero(): VotingPower {
    return VotingPower.create(Wei.create(new BigNumber(0)));
  }
}
