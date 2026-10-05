import { ENSName } from '@/domain/ens/ENSName';
import type { ENSStore } from '@/domain/ens/ENSStore';
import type {
  MemberStore,
  TokenVotingMemberData,
} from '@/domain/member/MemberStore';
import { TokenVotingMemberRecord } from '@/domain/member/TokenVotingMemberRecord';
import { Address, ChainId } from '@/domain/primitives';
import { createPage } from '@/domain/primitives/pagination/Page';
import { PageRequest } from '@/domain/primitives/pagination/PageRequest';
import { VotingPower } from '@/domain/voting-power/VotingPower';
import { GetTokenVotingMembershipUseCase } from './GetTokenVotingMembershipUseCase';

describe('GetTokenVotingMembershipUseCase', () => {
  const memberAddressValue = '0x1234567890abcdef1234567890abcdef12345678';
  const memberAddress = Address.fromHexString(memberAddressValue);
  const chainId = ChainId.fromNumber(1);
  const pluginAddress = Address.fromHexString(
    '0x1111111111111111111111111111111111111111',
  );
  const tokenContractAddress = Address.fromHexString(
    '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
  );
  const firstActivityTimestamp = new Date(1705320000 * 1000);
  const lastActivityTimestamp = new Date(1718872200 * 1000);

  // The member store returns record/activity pairs (no ENS); here the
  // activity window comes from the record's voting-power changes.
  const buildData = (): TokenVotingMemberData => ({
    record: TokenVotingMemberRecord.create({
      address: memberAddress,
      votingPower: VotingPower.fromBigInt(5000000000000000000n),
      delegationCount: 4,
      firstVotingPowerChangeTimestamp: firstActivityTimestamp,
      lastVotingPowerChangeTimestamp: lastActivityTimestamp,
    }),
    activity: null,
  });

  const buildMemberStore = (
    data: TokenVotingMemberData = buildData(),
  ): MemberStore => ({
    findTokenVotingMembers: vi
      .fn()
      .mockResolvedValue(createPage([data], 1, 20, 1)),
  });

  const buildEnsStore = (
    names: Map<string, ENSName> = new Map(),
  ): ENSStore => ({
    lookUpPrimaryNames: vi.fn().mockResolvedValue(names),
  });

  const page = PageRequest.create({ page: 1, pageSize: 20 });
  const props = { chainId, pluginAddress, tokenContractAddress, page };

  it('returns a page of members', async () => {
    const useCase = new GetTokenVotingMembershipUseCase(
      buildMemberStore(),
      buildEnsStore(),
    );
    const result = await useCase.execute(props);

    expect(result.items).toHaveLength(1);
    expect(result.items[0].address.equals(memberAddress)).toBe(true);
    expect(result.items[0].votingPower.isZero).toBe(false);
    expect(result.items[0].ens).toBeNull();
    expect(result.items[0].firstActivityTimestamp).toEqual(
      firstActivityTimestamp,
    );
    expect(result.items[0].lastActivityTimestamp).toEqual(
      lastActivityTimestamp,
    );
    expect(result.totalRecords).toBe(1);
  });

  it('passes chain id, plugin address, token address, and page to the member store', async () => {
    const memberStore = buildMemberStore();
    const useCase = new GetTokenVotingMembershipUseCase(
      memberStore,
      buildEnsStore(),
    );
    await useCase.execute(props);

    expect(memberStore.findTokenVotingMembers).toHaveBeenCalledWith({
      chainId,
      pluginAddress,
      tokenContractAddress,
      page,
    });
  });

  it('enriches each member with the ENS name resolved for its address', async () => {
    const names = new Map([
      [memberAddress.toHexString(), ENSName.fromString('alice.eth')],
    ]);
    const ensStore = buildEnsStore(names);
    const useCase = new GetTokenVotingMembershipUseCase(
      buildMemberStore(),
      ensStore,
    );

    const result = await useCase.execute(props);

    expect(result.items[0].ens?.toString()).toBe('alice.eth');
    // ENS lookups are scoped to the page's addresses.
    expect(ensStore.lookUpPrimaryNames).toHaveBeenCalledWith([memberAddress]);
  });

  it('leaves ens null when the address has no resolved name', async () => {
    const useCase = new GetTokenVotingMembershipUseCase(
      buildMemberStore(),
      buildEnsStore(new Map()),
    );

    const result = await useCase.execute(props);

    expect(result.items[0].ens).toBeNull();
  });

  it('wraps member-store errors', async () => {
    const failingStore: MemberStore = {
      findTokenVotingMembers: vi.fn().mockRejectedValue(new Error('db down')),
    };
    const useCase = new GetTokenVotingMembershipUseCase(
      failingStore,
      buildEnsStore(),
    );

    await expect(useCase.execute(props)).rejects.toThrow(
      'Error while getting token-voting membership',
    );
  });

  it('wraps ENS-store errors', async () => {
    const ensStore: ENSStore = {
      lookUpPrimaryNames: vi.fn().mockRejectedValue(new Error('rpc down')),
    };
    const useCase = new GetTokenVotingMembershipUseCase(
      buildMemberStore(),
      ensStore,
    );

    await expect(useCase.execute(props)).rejects.toThrow(
      'Error while getting token-voting membership',
    );
  });
});
