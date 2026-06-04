import { HexNumber } from '../math/HexNumber';
import type { HexString } from '../validation/ZodHexString';
import { Address } from './Address';

describe('Address', () => {
  let addressValue: HexNumber;
  let address: Address;

  beforeEach(() => {
    addressValue = HexNumber.create({
      hexNumberValue: '0x0123456789abcdef0123456789abcdef01234567',
    });
    address = Address.create({
      addressValue,
    });
  });

  it('creates an Address instance with valid props', () => {
    const address1 = Address.create({ addressValue });
    const address2 = Address.create({ addressValue });

    expect(address1.equals(address2)).toBeTruthy();
  });

  it('throws an error when creating a Address with an invalid prop', () => {
    const invalidAddressValue = HexNumber.create({
      hexNumberValue: '0x0123456789abcdef', // Invalid length
    });
    const createAddressWithInvalidProp = () =>
      Address.create({ addressValue: invalidAddressValue });

    expect(createAddressWithInvalidProp).toThrow(
      /addressValue must be 20 bytes/,
    );
  });

  it('throws for a 39 hex-digit value that would pad into 20 bytes', () => {
    const tooShortAddressValue = HexNumber.create({
      hexNumberValue: `0x${'a'.repeat(39)}`,
    });
    const createAddressWithInvalidProp = () =>
      Address.create({ addressValue: tooShortAddressValue });

    expect(createAddressWithInvalidProp).toThrow(
      /addressValue must be 20 bytes/,
    );
  });

  it('throws for a 41 hex-digit value', () => {
    const tooLongAddressValue = HexNumber.create({
      hexNumberValue: `0x${'a'.repeat(41)}`,
    });
    const createAddressWithInvalidProp = () =>
      Address.create({ addressValue: tooLongAddressValue });

    expect(createAddressWithInvalidProp).toThrow(
      /addressValue must be 20 bytes/,
    );
  });

  it('returns the correct checksum-based hex string', () => {
    const checksumValue = address.toHexString();

    const expectedChecksumValue = '0x0123456789abcDEF0123456789abCDef01234567';

    expect(checksumValue).toBe(expectedChecksumValue);
  });

  it('checks equality between two Address instances', () => {
    const addressValue1 = HexNumber.create({
      hexNumberValue: '0x0123456789abcdef0123456789abcdef01234567',
    });
    const addressValue2 = HexNumber.create({
      hexNumberValue: '0xabcdef0123456789abcdef0123456789abcdef01',
    });
    const addressValue3 = HexNumber.create({
      hexNumberValue: '0xabcdef0123456789abcdef0123456789abcdef01',
    });
    const address1 = Address.create({ addressValue: addressValue1 });
    const address2 = Address.create({ addressValue: addressValue2 });
    const address3 = Address.create({ addressValue: addressValue3 });

    expect(address1.equals(address2)).toBe(false);
    expect(address2.equals(address3)).toBe(true);
  });

  it('exposes the underlying HexNumber via toHexNumber()', () => {
    expect(address.toHexNumber()).toBe(addressValue);
  });

  it('constructs from a HexString', () => {
    const hex = '0x0123456789abcdef0123456789abcdef01234567' as HexString;
    const fromHex = Address.fromHexString(hex);

    // Internally normalizes to checksum casing; structural equality is
    // by checksum hex.
    expect(fromHex.equals(address)).toBe(true);
    expect(fromHex.toHexNumber().toHexString()).toBe(hex);
  });
});
