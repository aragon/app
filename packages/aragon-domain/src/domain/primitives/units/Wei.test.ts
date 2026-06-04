import BigNumber from 'bignumber.js';

import { Wei } from './Wei';

describe('Wei', () => {
  it('returns the base value', () => {
    const value = new BigNumber('1230000000000000000');
    const token = Wei.create(value);
    expect(token.toBigNumber()).toEqual(value);
  });

  it('converts to Gwei', () => {
    const value = new BigNumber('1230000000000000000');
    const token = Wei.create(value);
    expect(token.toGwei().toBigNumber().toNumber()).toEqual(1_230_000_000);
  });

  it('converts to Ether', () => {
    const value = new BigNumber('1230000000000000000');
    const token = Wei.create(value);
    expect(token.toEther().toBigNumber().toNumber()).toEqual(1.23);
  });

  it('allows zero', () => {
    const value = new BigNumber(0);
    const token = Wei.create(value);
    expect(token.toBigNumber()).toEqual(value);
  });

  it('adds another wei', () => {
    const value1 = new BigNumber('1230000000000000000');
    const token1 = Wei.create(value1);
    const value2 = new BigNumber(321);
    const token2 = Wei.create(value2);
    expect(token1.plus(token2).toBigNumber().toString()).toEqual(
      '1230000000000000321',
    );
  });

  it('multiplies a bignumber', () => {
    const value1 = new BigNumber(321);
    const token1 = Wei.create(value1);
    const value2 = new BigNumber(123);
    expect(token1.times(value2).toBigNumber().toNumber()).toEqual(39_483);
  });

  it('toWei() returns the same instance (identity conversion)', () => {
    const token = Wei.create(new BigNumber('1230000000000000000'));
    expect(token.toWei()).toBe(token);
  });
});
