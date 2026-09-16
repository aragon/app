import { Address } from '@/domain/primitives';
import { VotingPower } from '@/domain/voting-power/VotingPower';
import { TokenVotingMemberRecord } from './TokenVotingMemberRecord';

describe('TokenVotingMemberRecord', () => {
  const address = Address.fromHexString(
    '0x0123456789abcdef0123456789abcdef01234567',
  );

  const build = (
    overrides: Partial<
      Parameters<typeof TokenVotingMemberRecord.create>[0]
    > = {},
  ) =>
    TokenVotingMemberRecord.create({
      address,
      votingPower: VotingPower.fromBigInt(1000000000000000000n),
      delegationCount: 2,
      firstVotingPowerChangeTimestamp: new Date(1700000000 * 1000),
      lastVotingPowerChangeTimestamp: new Date(1700000100 * 1000),
      ...overrides,
    });

  it('exposes its properties', () => {
    const record = build();
    expect(record.address.equals(address)).toBe(true);
    expect(record.votingPower.isZero).toBe(false);
    expect(record.delegationCount).toBe(2);
    expect(record.firstVotingPowerChangeTimestamp).toEqual(
      new Date(1700000000 * 1000),
    );
    expect(record.lastVotingPowerChangeTimestamp).toEqual(
      new Date(1700000100 * 1000),
    );
  });

  it('allows null voting-power-change timestamps', () => {
    const record = build({
      firstVotingPowerChangeTimestamp: null,
      lastVotingPowerChangeTimestamp: null,
    });
    expect(record.firstVotingPowerChangeTimestamp).toBeNull();
    expect(record.lastVotingPowerChangeTimestamp).toBeNull();
  });

  it('rejects a negative delegation count', () => {
    expect(() => build({ delegationCount: -1 })).toThrow();
  });
});
