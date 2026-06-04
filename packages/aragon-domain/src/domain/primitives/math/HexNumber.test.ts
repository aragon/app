import { HexNumber } from './HexNumber';

describe('HexNumber', () => {
  let hexNumber: HexNumber;

  beforeEach(() => {
    const hexNumberValue = '0x123456';
    hexNumber = HexNumber.create({
      hexNumberValue,
    });
  });

  it('returns the correct hex number value', () => {
    const value = hexNumber.toHexString();

    expect(value).toBe('0x123456');
  });

  it('returns the correct big int number', () => {
    const value = HexNumber.create({ hexNumberValue: '0x' });

    expect(value.toBigint()).toBe(0n);
  });

  it('returns the correct BigInt value', () => {
    const decimalValue = hexNumber.toBigint();

    expect(decimalValue).toEqual(BigInt(1_193_046));
  });

  it('returns the correct BigInt value larger than Number.MAX_SAFE_INTEGER', () => {
    const decimalValue = BigInt(Number.MAX_SAFE_INTEGER) * BigInt(3);
    const largerHexNumber = HexNumber.createFromDecimal(decimalValue);

    expect(largerHexNumber.toBigint()).toEqual(decimalValue);
  });

  it('creates a HexNumber instance from a decimal number', () => {
    const decimalNumber = 1_234_567_890;
    hexNumber = HexNumber.createFromDecimal(decimalNumber);

    expect(hexNumber.toHexString()).toBe('0x499602d2');
  });

  it('throws an error when an invalid hex number is created', () => {
    const invalidProps = {
      hexNumberValue: 'invalid_hex_string',
      // biome-ignore lint/suspicious/noExplicitAny: testing illegal arg
    } as any;

    expect(() => HexNumber.create(invalidProps)).toThrow();
  });

  it('matches the exact byte length', () => {
    // '0x123456' is 6 hex digits = 3 bytes
    expect(hexNumber.hasByteLength(3)).toBe(true);
    expect(hexNumber.hasByteLength(2)).toBe(false);
    expect(hexNumber.hasByteLength(4)).toBe(false);
  });

  it('rejects odd-length hex rather than padding it into a valid byte length', () => {
    // 39 hex digits: would pad to 20 bytes, but is not a whole 20-byte value
    const oddHex = HexNumber.create({
      hexNumberValue: `0x${'a'.repeat(39)}`,
    });

    expect(oddHex.hasByteLength(20)).toBe(false);
  });

  it('checks equality between two HexNumber instances and ignores the alphabetic case', () => {
    const hexNumber1 = HexNumber.create({
      hexNumberValue: '0x123456abcd',
    });
    const hexNumber2 = HexNumber.create({
      hexNumberValue: '0x123456ABCD',
    });
    const hexNumber3 = HexNumber.create({
      hexNumberValue: '0xabcdef',
    });

    expect(hexNumber1.equals(hexNumber2)).toBe(true);
    expect(hexNumber2.equals(hexNumber3)).toBe(false);
  });

  it('handles HexNumber initialized with "0x"', () => {
    const hexNumberZero = HexNumber.create({ hexNumberValue: '0x' });

    expect(hexNumberZero.toHexString()).toBe('0x');
    expect(hexNumberZero.toBigint()).toBe(0n);

    expect(hexNumberZero.hasByteLength(0)).toBe(true);
    expect(
      hexNumberZero.equals(HexNumber.create({ hexNumberValue: '0x' })),
    ).toBe(true);
    expect(
      hexNumberZero.equals(HexNumber.create({ hexNumberValue: '0x0' })),
    ).toBe(false);
  });

  it('handles HexNumber initialized with "0x0"', () => {
    const hexNumberZero = HexNumber.create({ hexNumberValue: '0x0' });

    expect(hexNumberZero.toHexString()).toBe('0x0');
    expect(hexNumberZero.toBigint()).toBe(0n);

    // 1 hex digit is an odd nibble, not a whole byte
    expect(hexNumberZero.hasByteLength(1)).toBe(false);
    expect(
      hexNumberZero.equals(HexNumber.create({ hexNumberValue: '0x0' })),
    ).toBe(true);
    expect(
      hexNumberZero.equals(HexNumber.create({ hexNumberValue: '0x' })),
    ).toBe(false);
  });

  it('handles HexNumber initialized with "0x000"', () => {
    const hexNumberZero = HexNumber.create({ hexNumberValue: '0x000' });

    expect(hexNumberZero.toHexString()).toBe('0x000');
    expect(hexNumberZero.toBigint()).toBe(0n);

    // 3 hex digits is an odd nibble count, not a whole number of bytes
    expect(hexNumberZero.hasByteLength(2)).toBe(false);
    expect(
      hexNumberZero.equals(HexNumber.create({ hexNumberValue: '0x000' })),
    ).toBe(true);
    expect(
      hexNumberZero.equals(HexNumber.create({ hexNumberValue: '0x' })),
    ).toBe(false);
  });
});
