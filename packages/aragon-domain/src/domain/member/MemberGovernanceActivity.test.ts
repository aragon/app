import { Address } from '@/domain/primitives';
import { MemberGovernanceActivity } from './MemberGovernanceActivity';

describe('MemberGovernanceActivity', () => {
  const memberAddress = Address.fromHexString(
    '0x0123456789abcdef0123456789abcdef01234567',
  );

  it('exposes its properties', () => {
    const activity = MemberGovernanceActivity.create({
      memberAddress,
      firstGovernanceActivityTimestamp: new Date(1650000000 * 1000),
      lastGovernanceActivityTimestamp: new Date(1750000000 * 1000),
    });

    expect(activity.memberAddress.equals(memberAddress)).toBe(true);
    expect(activity.firstGovernanceActivityTimestamp).toEqual(
      new Date(1650000000 * 1000),
    );
    expect(activity.lastGovernanceActivityTimestamp).toEqual(
      new Date(1750000000 * 1000),
    );
  });

  it('allows null activity timestamps', () => {
    const activity = MemberGovernanceActivity.create({
      memberAddress,
      firstGovernanceActivityTimestamp: null,
      lastGovernanceActivityTimestamp: null,
    });

    expect(activity.firstGovernanceActivityTimestamp).toBeNull();
    expect(activity.lastGovernanceActivityTimestamp).toBeNull();
  });

  it('rejects a non-date timestamp', () => {
    expect(() =>
      MemberGovernanceActivity.create({
        memberAddress,
        firstGovernanceActivityTimestamp: 1650000000 as unknown as Date,
        lastGovernanceActivityTimestamp: new Date(1750000000 * 1000),
      }),
    ).toThrow();
  });
});
