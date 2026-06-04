import { assertHexString, type HexString, hexString } from './ZodHexString';

describe('hexString', () => {
  it('validates a valid hex string', () => {
    const schema = hexString();
    const validHex: HexString = '0xabcdef123456';
    expect(schema.parse(validHex)).toBe(validHex);
  });

  it('rejects an invalid hex string', () => {
    const schema = hexString();
    expect(() => schema.parse('0xGHIJKL')).toThrow('Invalid hex string');
    expect(() => schema.parse('123456')).toThrow('Invalid hex string');
    expect(() => schema.parse('0Xabc')).toThrow('Invalid hex string');
    expect(() => schema.parse('')).toThrow('Invalid hex string');
  });

  it('allows an empty hex string', () => {
    const schema = hexString();
    expect(schema.parse('0x')).toBe('0x');
  });

  it('allows capital letters in the hex string', () => {
    const schema = hexString();
    expect(schema.parse('0xABCDEF123456')).toBe('0xABCDEF123456');
  });
});

describe('assertHexString', () => {
  it('does not throw for a valid hex string', () => {
    const validHex: unknown = '0xabcdef123456';
    expect(() => assertHexString(validHex)).not.toThrow();
  });

  it('throws for an invalid hex string', () => {
    const invalidHex: unknown = '0xGHIJKL';
    expect(() => assertHexString(invalidHex)).toThrow('Invalid hex string');
  });

  it('throws with a custom error message', () => {
    const invalidHex: unknown = '123456';
    expect(() => assertHexString(invalidHex, 'Custom error message')).toThrow(
      'Custom error message',
    );
  });

  it('narrows the type to HexString for valid input', () => {
    const validHex: unknown = '0xabcdef123456';
    assertHexString(validHex);
    // After assertion, validHex is now typed as HexString
    const hex: HexString = validHex;
    expect(hex).toBe('0xabcdef123456');
  });

  it('allows capital letters in the hex string', () => {
    const validHex: unknown = '0xABCDEF123456';
    assertHexString(validHex);
  });
});
