import BigNumber from 'bignumber.js';

import { Ether } from './Ether';

describe('Ether', () => {
  it('returns the base value', () => {
    const value = new BigNumber(1.23);
    const token = Ether.create(value);
    expect(token.toBigNumber()).toEqual(value);
  });

  it('converts to Wei', () => {
    const value = new BigNumber(1.23);
    const token = Ether.create(value);
    expect(token.toWei().toBigNumber().toString()).toEqual(
      '1230000000000000000',
    );
  });

  it('converts to Gwei', () => {
    const value = new BigNumber(1.23);
    const token = Ether.create(value);
    expect(token.toGwei().toBigNumber().toNumber()).toEqual(1_230_000_000);
  });

  it('allows zero', () => {
    const value = new BigNumber(0);
    const token = Ether.create(value);
    expect(token.toBigNumber()).toEqual(value);
  });

  it('adds another ether', () => {
    const value1 = new BigNumber(1.23);
    const token1 = Ether.create(value1);
    const value2 = new BigNumber(2.77);
    const token2 = Ether.create(value2);
    expect(token1.plus(token2).toBigNumber().toNumber()).toEqual(4);
  });

  it('multiplies a bignumber', () => {
    const value1 = new BigNumber(1.5);
    const token1 = Ether.create(value1);
    const value2 = new BigNumber(4);
    expect(token1.times(value2).toBigNumber().toNumber()).toEqual(6);
  });

  it('toEther() returns the same instance (identity conversion)', () => {
    const token = Ether.create(new BigNumber(1.23));
    expect(token.toEther()).toBe(token);
  });
});
