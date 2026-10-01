import { MemberProfileAragonName } from '@/domain/member-profile/MemberProfileAragonName';
import type { MemberProfileStore } from '@/domain/member-profile/MemberProfileStore';
import { MemberProfileTextRecord } from '@/domain/member-profile/MemberProfileTextRecord';
import { GetMemberProfileTextRecordsUseCase } from './GetMemberProfileTextRecordsUseCase';

describe('GetMemberProfileTextRecordsUseCase', () => {
  const subdomain = MemberProfileAragonName.fromString('ea1.aragon.eth');

  const buildRecord = (key: string, value: string) =>
    MemberProfileTextRecord.create({ key, value });

  const buildMockStore = (
    records: MemberProfileTextRecord[] = [],
  ): MemberProfileStore => ({
    findTextRecordsBySubdomain: vi.fn().mockResolvedValue(records),
  });

  it('returns the text records from the store', async () => {
    const records = [
      buildRecord('avatar', 'ipfs://x'),
      buildRecord('url', 'https://aragon.org'),
    ];
    const useCase = new GetMemberProfileTextRecordsUseCase(
      buildMockStore(records),
    );

    const result = await useCase.execute({ subdomain });

    expect(result).toBe(records);
  });

  it('returns an empty array when the store returns nothing', async () => {
    const useCase = new GetMemberProfileTextRecordsUseCase(buildMockStore([]));

    const result = await useCase.execute({ subdomain });

    expect(result).toEqual([]);
  });

  it('forwards the subdomain value object to the store unchanged', async () => {
    const store = buildMockStore();
    const useCase = new GetMemberProfileTextRecordsUseCase(store);

    await useCase.execute({ subdomain });

    expect(store.findTextRecordsBySubdomain).toHaveBeenCalledTimes(1);
    expect(store.findTextRecordsBySubdomain).toHaveBeenCalledWith(subdomain);
  });

  it('wraps store errors with a use-case message', async () => {
    const failingStore: MemberProfileStore = {
      findTextRecordsBySubdomain: vi
        .fn()
        .mockRejectedValue(new Error('graphql exploded')),
    };
    const useCase = new GetMemberProfileTextRecordsUseCase(failingStore);

    await expect(useCase.execute({ subdomain })).rejects.toThrow(
      'Error while getting member profile text records',
    );
  });
});
