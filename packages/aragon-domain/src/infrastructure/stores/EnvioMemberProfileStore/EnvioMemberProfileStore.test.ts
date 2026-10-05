import { MemberProfileAragonName } from '@/domain/member-profile/MemberProfileAragonName';
import type { EnvioClient } from '@/infrastructure/stores/EnvioClient';
import { EnvioMemberProfileStore } from './EnvioMemberProfileStore';

interface QueryCall {
  document: string;
  variables: Record<string, unknown>;
}

interface MockClient {
  envio: EnvioClient;
  calls: QueryCall[];
}

function buildMockEnvioClient(responses: unknown[]): MockClient {
  const calls: QueryCall[] = [];
  const queue = [...responses];
  const envio = {
    query: vi.fn(
      async (document: string, variables: Record<string, unknown>) => {
        calls.push({ document, variables });
        return queue.shift();
      },
    ),
  } as unknown as EnvioClient;
  return { envio, calls };
}

describe('EnvioMemberProfileStore', () => {
  const subdomain = MemberProfileAragonName.fromString('ea1.aragon.eth');

  it('returns the live text records for a subdomain', async () => {
    const { envio, calls } = buildMockEnvioClient([
      {
        Domain: [
          {
            resolver: {
              texts: [
                { key: 'avatar', value: 'ipfs://x' },
                { key: 'url', value: 'https://aragon.org' },
              ],
            },
          },
        ],
      },
    ]);
    const store = new EnvioMemberProfileStore(envio);

    const result = await store.findTextRecordsBySubdomain(subdomain);

    expect(result).toHaveLength(2);
    expect(result[0].key).toBe('avatar');
    expect(result[0].value).toBe('ipfs://x');
    expect(result[1].key).toBe('url');
    expect(result[1].value).toBe('https://aragon.org');

    expect(calls).toHaveLength(1);
    expect(calls[0].variables).toEqual({ name: 'ea1.aragon.eth' });
  });

  it('queries the indexer by the subdomain canonical value', async () => {
    const { envio, calls } = buildMockEnvioClient([{ Domain: [] }]);
    const store = new EnvioMemberProfileStore(envio);

    const mixedCase = MemberProfileAragonName.fromString('EA1.Aragon.ETH');
    await store.findTextRecordsBySubdomain(mixedCase);

    expect(calls[0].variables).toEqual({ name: 'ea1.aragon.eth' });
  });

  it('returns [] when the subdomain is not on the indexer', async () => {
    const { envio } = buildMockEnvioClient([{ Domain: [] }]);
    const store = new EnvioMemberProfileStore(envio);

    const result = await store.findTextRecordsBySubdomain(subdomain);

    expect(result).toEqual([]);
  });

  it('returns [] when the subdomain has no resolver set yet', async () => {
    const { envio } = buildMockEnvioClient([
      {
        Domain: [
          {
            resolver: null,
          },
        ],
      },
    ]);
    const store = new EnvioMemberProfileStore(envio);

    const result = await store.findTextRecordsBySubdomain(subdomain);

    expect(result).toEqual([]);
  });

  it('wraps GraphQL failures with a profile-level error', async () => {
    const envio = {
      query: vi.fn().mockRejectedValue(new Error('graphql exploded')),
    } as unknown as EnvioClient;
    const store = new EnvioMemberProfileStore(envio);

    await expect(store.findTextRecordsBySubdomain(subdomain)).rejects.toThrow(
      'Error querying member profile from Envio',
    );
  });
});
