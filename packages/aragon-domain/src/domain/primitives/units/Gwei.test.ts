import BigNumber from 'bignumber.js';

import { Gwei } from './Gwei';

describe('Gwei', () => {
  it('returns the base value', () => {
    const value = new BigNumber(1_230_000_000);
    const token = Gwei.create(value);
    expect(token.toBigNumber()).toEqual(value);
  });

  it('converts to Wei', () => {
    const value = new BigNumber(1_230_000_000);
    const token = Gwei.create(value);
    expect(token.toWei().toBigNumber().toString()).toEqual(
      '1230000000000000000',
    );
  });

  it('converts to Ether', () => {
    const value = new BigNumber(1_230_000_000);
    const token = Gwei.create(value);
    expect(token.toEther().toBigNumber().toNumber()).toEqual(1.23);
  });

  it('allows zero', () => {
    const value = new BigNumber(0);
    const token = Gwei.create(value);
    expect(token.toBigNumber()).toEqual(value);
  });

  it('adds another gwei', () => {
    const value1 = new BigNumber(1_230_000_000);
    const token1 = Gwei.create(value1);
    const value2 = new BigNumber(321);
    const token2 = Gwei.create(value2);
    expect(token1.plus(token2).toBigNumber().toNumber()).toEqual(1_230_000_321);
  });

  it('multiplies a bignumber', () => {
    const value1 = new BigNumber(321);
    const token1 = Gwei.create(value1);
    const value2 = new BigNumber(123);
    expect(token1.times(value2).toBigNumber().toNumber()).toEqual(39_483);
  });

  it('toGwei() returns the same instance (identity conversion)', () => {
    const token = Gwei.create(new BigNumber(1_230_000_000));
    expect(token.toGwei()).toBe(token);
  });

  it('equals compares by numeric value across instances', () => {
    const a = Gwei.create(new BigNumber(100));
    const b = Gwei.create(new BigNumber(100));
    const c = Gwei.create(new BigNumber(200));
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });

  it('equals(undefined) returns false', () => {
    const token = Gwei.create(new BigNumber(100));
    expect(token.equals(undefined)).toBe(false);
  });
});
