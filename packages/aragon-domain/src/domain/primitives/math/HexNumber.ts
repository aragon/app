import { ValueObject } from 'ddd-core-ts';
import { z } from 'zod';
import { zExtended } from '../validation';
import type { HexString } from '../validation/ZodHexString';

const HexNumberPropsSchema = z.object({
  hexNumberValue: zExtended.hexString(),
});

type HexNumberProps = z.infer<typeof HexNumberPropsSchema>;

export class HexNumber extends ValueObject<HexNumberProps> {
  /**
   * @returns The number as a lowercase base 16 string value, prefixed with 0x.
   */
  public toHexString(): HexString {
    return this.props.hexNumberValue.toLowerCase() as HexString;
  }

  /**
   * @returns The decimal value of the hex number.
   */
  public toBigint(): bigint {
    if (this.props.hexNumberValue === '0x') {
      return 0n;
    }
    return BigInt(this.props.hexNumberValue);
  }

  /**
   * @param byteLength The expected number of bytes.
   * @returns True only when the hex represents exactly `byteLength` whole
   * bytes (i.e. `byteLength * 2` hex digits). Odd-length values never match,
   * so a partial nibble cannot be silently padded into a valid length.
   */
  public hasByteLength(byteLength: number): boolean {
    const hex = this.props.hexNumberValue.replace(/^0x/, '');
    return hex.length === byteLength * 2;
  }

  public equals(other: HexNumber): boolean {
    return (
      this.props.hexNumberValue.toLowerCase() ===
      other.props.hexNumberValue.toLowerCase()
    );
  }

  public static create(props: HexNumberProps): HexNumber {
    const validatedProps = HexNumberPropsSchema.parse(props);
    return new HexNumber(validatedProps);
  }

  /**
   * Creates a HexNumber instance from a decimal number.
   * @param decimalNumber A decimal bigint or number.
   */
  public static createFromDecimal(decimalNumber: bigint | number): HexNumber {
    return HexNumber.create({
      hexNumberValue: `0x${decimalNumber.toString(16)}`,
    });
  }
}
