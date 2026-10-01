import { ENSName } from './ENSName';

describe('ENSName', () => {
  it('stores a valid name', () => {
    expect(ENSName.fromString('alice.eth').toString()).toBe('alice.eth');
  });

  it('normalizes to the ENSIP-15 canonical form (case folding)', () => {
    expect(ENSName.fromString('Alice.ETH').toString()).toBe('alice.eth');
  });

  it('preserves a non-.eth primary name (e.g. an L2 basename)', () => {
    expect(ENSName.fromString('alice.base.eth').toString()).toBe(
      'alice.base.eth',
    );
  });

  it('throws on an empty name', () => {
    expect(() => ENSName.fromString('')).toThrow();
  });

  it('throws on a name with disallowed characters', () => {
    expect(() => ENSName.fromString('has space.eth')).toThrow();
  });

  it('compares equal for equal names', () => {
    expect(
      ENSName.fromString('alice.eth').equals(ENSName.fromString('Alice.eth')),
    ).toBe(true);
  });
});
