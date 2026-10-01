import { ENSName } from '@/domain/ens/ENSName';
import { Address } from '@/domain/primitives';
import { VotingPower } from '@/domain/voting-power/VotingPower';
import { MemberGovernanceActivity } from './MemberGovernanceActivity';
import { TokenVotingMember } from './TokenVotingMember';
import { TokenVotingMemberRecord } from './TokenVotingMemberRecord';

describe('TokenVotingMember', () => {
  const address = Address.fromHexString(
    '0x0123456789abcdef0123456789abcdef01234567',
  );

  const buildRecord = (
    overrides: Partial<
      Parameters<typeof TokenVotingMemberRecord.create>[0]
    > = {},
  ) =>
    TokenVotingMemberRecord.create({
      address,
      votingPower: VotingPower.fromBigInt(1000000000000000000n),
      delegationCount: 3,
      firstVotingPowerChangeTimestamp: new Date(1700000000 * 1000),
      lastVotingPowerChangeTimestamp: new Date(1700000100 * 1000),
      ...overrides,
    });

  const buildActivity = (
    overrides: Partial<
      Parameters<typeof MemberGovernanceActivity.create>[0]
    > = {},
  ) =>
    MemberGovernanceActivity.create({
      memberAddress: address,
      firstGovernanceActivityTimestamp: new Date(1650000000 * 1000),
      lastGovernanceActivityTimestamp: new Date(1750000000 * 1000),
      ...overrides,
    });

  describe('getters delegate to the source objects', () => {
    it('pulls identity, voting power, and delegation count from the record', () => {
      const member = TokenVotingMember.create(buildRecord(), null, null);
      expect(member.address.equals(address)).toBe(true);
      expect(member.votingPower.isZero).toBe(false);
      expect(member.delegationCount).toBe(3);
    });

    it('pulls the ENS name from the composed name', () => {
      const named = TokenVotingMember.create(
        buildRecord(),
        null,
        ENSName.fromString('alice.eth'),
      );
      expect(named.ens?.toString()).toBe('alice.eth');

      const anonymous = TokenVotingMember.create(buildRecord(), null, null);
      expect(anonymous.ens).toBeNull();
    });
  });

  describe('activity window is derived in the getters', () => {
    it('spans the earliest/latest across governance activity and VP changes', () => {
      const member = TokenVotingMember.create(
        buildRecord(),
        buildActivity(),
        null,
      );
      // earliest first: activity 1650000000 < record 1700000000
      expect(member.firstActivityTimestamp).toEqual(
        new Date(1650000000 * 1000),
      );
      // latest last: activity 1750000000 > record 1700000100
      expect(member.lastActivityTimestamp).toEqual(new Date(1750000000 * 1000));
    });

    it('uses the VP-change window when there is no governance activity', () => {
      const member = TokenVotingMember.create(buildRecord(), null, null);
      expect(member.firstActivityTimestamp).toEqual(
        new Date(1700000000 * 1000),
      );
      expect(member.lastActivityTimestamp).toEqual(new Date(1700000100 * 1000));
    });

    it('uses the governance window when the record has no VP changes', () => {
      const member = TokenVotingMember.create(
        buildRecord({
          firstVotingPowerChangeTimestamp: null,
          lastVotingPowerChangeTimestamp: null,
        }),
        buildActivity(),
        null,
      );
      expect(member.firstActivityTimestamp).toEqual(
        new Date(1650000000 * 1000),
      );
      expect(member.lastActivityTimestamp).toEqual(new Date(1750000000 * 1000));
    });

    it('reports null timestamps when no activity signal is present', () => {
      const member = TokenVotingMember.create(
        buildRecord({
          firstVotingPowerChangeTimestamp: null,
          lastVotingPowerChangeTimestamp: null,
        }),
        null,
        null,
      );
      expect(member.firstActivityTimestamp).toBeNull();
      expect(member.lastActivityTimestamp).toBeNull();
    });
  });

  describe('equals', () => {
    it('is structural over the composed objects', () => {
      const record = buildRecord();
      const activity = buildActivity();
      const a = TokenVotingMember.create(record, activity, null);
      const b = TokenVotingMember.create(record, activity, null);
      expect(a.equals(b)).toBe(true);
    });

    it('differs when the composed record differs', () => {
      const activity = buildActivity();
      const a = TokenVotingMember.create(buildRecord(), activity, null);
      const b = TokenVotingMember.create(
        buildRecord({ votingPower: VotingPower.zero() }),
        activity,
        null,
      );
      expect(a.equals(b)).toBe(false);
    });
  });
});
