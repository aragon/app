import { ChainId } from './ChainId';

describe('ChainId', () => {
  it('creates from a positive integer', () => {
    const chainId = ChainId.fromNumber(1);
    expect(chainId.toNumber()).toBe(1);
  });

  it('creates from props', () => {
    const chainId = ChainId.create({ chainIdValue: 8453 });
    expect(chainId.toNumber()).toBe(8453);
  });

  it.each([0, -1, 1.5, Number.NaN])('rejects %s', (value) => {
    expect(() => ChainId.fromNumber(value)).toThrow();
  });

  it('compares by numeric value', () => {
    expect(ChainId.fromNumber(1).equals(ChainId.fromNumber(1))).toBe(true);
    expect(ChainId.fromNumber(1).equals(ChainId.fromNumber(10))).toBe(false);
  });
});
