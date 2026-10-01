import { ENSName } from '@/domain/ens/ENSName';
import { TokenVotingMember } from '@/domain/member/TokenVotingMember';
import { TokenVotingMemberRecord } from '@/domain/member/TokenVotingMemberRecord';
import { Address } from '@/domain/primitives';
import { VotingPower } from '@/domain/voting-power/VotingPower';
import { mapDomainToDTO } from './TokenVotingMemberMap';

describe('TokenVotingMemberMap.mapDomainToDTO', () => {
  const address = Address.fromHexString(
    '0x0123456789abcdef0123456789abcdef01234567',
  );

  const buildMember = (
    opts: {
      ens?: ENSName | null;
      firstVotingPowerChangeTimestamp?: Date | null;
      lastVotingPowerChangeTimestamp?: Date | null;
    } = {},
  ) => {
    const {
      ens = ENSName.fromString('alice.eth'),
      firstVotingPowerChangeTimestamp = new Date(1705320000 * 1000),
      lastVotingPowerChangeTimestamp = new Date(1718872200 * 1000),
    } = opts;
    return TokenVotingMember.create(
      TokenVotingMemberRecord.create({
        address,
        votingPower: VotingPower.fromBigInt(5000000000000000000n),
        delegationCount: 3,
        firstVotingPowerChangeTimestamp,
        lastVotingPowerChangeTimestamp,
      }),
      null,
      ens,
    );
  };

  it('maps a Member with full activity to a DTO', () => {
    const dto = mapDomainToDTO(buildMember());

    expect(dto.ens).toBe('alice.eth');
    expect(dto.address).toMatch(/^0x[0-9a-fA-F]{40}$/);
    expect(dto.votingPower).toBe('5000000000000000000');
    expect(dto.firstActivityTimestamp).toBe(
      new Date(1705320000 * 1000).toISOString(),
    );
    expect(dto.lastActivityTimestamp).toBe(
      new Date(1718872200 * 1000).toISOString(),
    );
    expect(dto.delegationCount).toBe(3);
  });

  it('serializes missing activity timestamps as null (no recorded activity)', () => {
    const dto = mapDomainToDTO(
      buildMember({
        firstVotingPowerChangeTimestamp: null,
        lastVotingPowerChangeTimestamp: null,
      }),
    );

    expect(dto.firstActivityTimestamp).toBeNull();
    expect(dto.lastActivityTimestamp).toBeNull();
  });
});
