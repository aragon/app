import { ENSName } from '@/domain/ens/ENSName';
import { TokenVotingMember } from '@/domain/member/TokenVotingMember';
import { TokenVotingMemberRecord } from '@/domain/member/TokenVotingMemberRecord';
import { Address } from '@/domain/primitives';
import { createPage } from '@/domain/primitives/pagination/Page';
import { VotingPower } from '@/domain/voting-power/VotingPower';
import { mapDomainToDTO, mapDTOToDomain } from './GetTokenVotingMembershipMap';

describe('GetTokenVotingMembershipMap', () => {
  const chainId = 1;
  const pluginAddress = '0x1111111111111111111111111111111111111111';
  const tokenContractAddress = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';

  describe('mapDTOToDomain', () => {
    it('passes explicit page and pageSize through to the PageRequest', () => {
      const result = mapDTOToDomain({
        chainId,
        pluginAddress,
        tokenContractAddress,
        page: 3,
        pageSize: 50,
      });

      expect(result.page.page).toBe(3);
      expect(result.page.pageSize).toBe(50);
    });

    it('defaults page to 1 and pageSize to 20 when omitted', () => {
      const result = mapDTOToDomain({
        chainId,
        pluginAddress,
        tokenContractAddress,
      });

      expect(result.page.page).toBe(1);
      expect(result.page.pageSize).toBe(20);
    });

    it('converts the chain id and the plugin and token addresses to value objects', () => {
      const result = mapDTOToDomain({
        chainId,
        pluginAddress,
        tokenContractAddress,
      });

      expect(result.chainId.toNumber()).toBe(1);
      expect(
        result.pluginAddress.equals(Address.fromHexString(pluginAddress)),
      ).toBe(true);
      expect(
        result.tokenContractAddress.equals(
          Address.fromHexString(tokenContractAddress),
        ),
      ).toBe(true);
    });

    it('rejects an invalid chain id', () => {
      expect(() =>
        mapDTOToDomain({ chainId: 0, pluginAddress, tokenContractAddress }),
      ).toThrow();
    });

    it('rejects a non-hex plugin address', () => {
      expect(() =>
        mapDTOToDomain({
          chainId,
          pluginAddress: 'not-an-address',
          tokenContractAddress,
        }),
      ).toThrow(/plugin address/);
    });
  });

  describe('mapDomainToDTO', () => {
    it('maps a domain page to a PageDTO of TokenVotingMemberDTO', () => {
      const member = TokenVotingMember.create(
        TokenVotingMemberRecord.create({
          address: Address.fromHexString(
            '0x0123456789abcdef0123456789abcdef01234567',
          ),
          votingPower: VotingPower.fromBigInt(5000000000000000000n),
          delegationCount: 3,
          firstVotingPowerChangeTimestamp: new Date(1705320000 * 1000),
          lastVotingPowerChangeTimestamp: new Date(1718872200 * 1000),
        }),
        null,
        ENSName.fromString('alice.eth'),
      );
      const page = createPage([member], 1, 20, 1);

      const dto = mapDomainToDTO(page);

      expect(dto.metadata).toEqual({
        page: 1,
        pageSize: 20,
        totalPages: 1,
        totalRecords: 1,
      });
      expect(dto.data).toHaveLength(1);
      expect(dto.data[0].ens).toBe('alice.eth');
      expect(dto.data[0].votingPower).toBe('5000000000000000000');
      expect(dto.data[0].delegationCount).toBe(3);
    });
  });
});
