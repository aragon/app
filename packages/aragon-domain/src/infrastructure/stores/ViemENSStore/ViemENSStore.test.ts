import { createPublicClient, http, type PublicClient } from 'viem';
import { mainnet } from 'viem/chains';
import { Address } from '@/domain/primitives';
import { ViemENSStore } from './ViemENSStore';

// `createPublicClient` / `http` are stubbed so `fromRpcUrls` can be asserted
// without a real RPC; everything else (e.g. `getAddress` used by `Address`)
// is the real implementation.
vi.mock('viem', async (importOriginal) => ({
  ...(await importOriginal<typeof import('viem')>()),
  createPublicClient: vi.fn(),
  http: vi.fn((url?: string) => ({ url })),
}));

const MAINNET_RPC = 'https://eth.example/rpc';
const ALICE = '0x0123456789abcdef0123456789abcdef01234567';
const BOB = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

const address = (hex: string) => Address.fromHexString(hex as `0x${string}`);

/**
 * A stub viem client whose `getEnsName` resolves from a
 * `name-by-lowercase-address` table. Absent addresses resolve to `null`;
 * addresses mapped to an `Error` reject (RPC failure).
 */
function buildClient(table: Record<string, string | null | Error>) {
  const getEnsName = vi.fn(
    async ({ address: addr }: { address: string; coinType?: bigint }) => {
      const entry = table[addr.toLowerCase()];
      if (entry instanceof Error) {
        throw entry;
      }
      return entry ?? null;
    },
  );
  return { client: { getEnsName } as unknown as PublicClient, getEnsName };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ViemENSStore.fromRpcUrls', () => {
  it('builds a mainnet client with multicall batching from the chain-id URL map', () => {
    vi.mocked(createPublicClient).mockReturnValue(buildClient({}).client);

    ViemENSStore.fromRpcUrls({ [mainnet.id]: MAINNET_RPC });

    expect(http).toHaveBeenCalledWith(MAINNET_RPC);
    expect(createPublicClient).toHaveBeenCalledWith(
      expect.objectContaining({ chain: mainnet, batch: { multicall: true } }),
    );
  });

  it('throws when the map has no mainnet entry instead of falling back to the public endpoint', () => {
    expect(() => ViemENSStore.fromRpcUrls({ 137: MAINNET_RPC })).toThrow(
      /chain id 1/,
    );
    expect(createPublicClient).not.toHaveBeenCalled();
  });

  it('produces a store that resolves names through the built client', async () => {
    const { client } = buildClient({ [ALICE]: 'alice.eth' });
    vi.mocked(createPublicClient).mockReturnValue(client);

    const store = ViemENSStore.fromRpcUrls({ [mainnet.id]: MAINNET_RPC });
    const names = await store.lookUpPrimaryNames([address(ALICE)]);

    expect(names.get(address(ALICE).toHexString())?.toString()).toBe(
      'alice.eth',
    );
  });
});

describe('ViemENSStore.lookUpPrimaryNames', () => {
  it('returns a map keyed by checksummed address for resolved names', async () => {
    const store = new ViemENSStore(
      buildClient({ [ALICE]: 'alice.eth' }).client,
    );

    const names = await store.lookUpPrimaryNames([address(ALICE)]);

    expect(names.get(address(ALICE).toHexString())?.toString()).toBe(
      'alice.eth',
    );
  });

  it('omits addresses with no primary name', async () => {
    const store = new ViemENSStore(
      buildClient({ [ALICE]: 'alice.eth', [BOB]: null }).client,
    );

    const names = await store.lookUpPrimaryNames([
      address(ALICE),
      address(BOB),
    ]);

    expect(names.has(address(ALICE).toHexString())).toBe(true);
    expect(names.has(address(BOB).toHexString())).toBe(false);
  });

  it('degrades a per-address RPC failure to "no name" without failing the page', async () => {
    const store = new ViemENSStore(
      buildClient({
        [ALICE]: 'alice.eth',
        [BOB]: new Error('rpc exploded'),
      }).client,
    );

    const names = await store.lookUpPrimaryNames([
      address(ALICE),
      address(BOB),
    ]);

    expect(names.get(address(ALICE).toHexString())?.toString()).toBe(
      'alice.eth',
    );
    expect(names.has(address(BOB).toHexString())).toBe(false);
  });

  it('drops a name that fails ENSIP-15 normalization', async () => {
    const store = new ViemENSStore(
      buildClient({ [ALICE]: 'has space.eth' }).client,
    );

    const names = await store.lookUpPrimaryNames([address(ALICE)]);

    expect(names.has(address(ALICE).toHexString())).toBe(false);
  });

  it('normalizes resolved names to their canonical form', async () => {
    const store = new ViemENSStore(
      buildClient({ [ALICE]: 'Alice.ETH' }).client,
    );

    const names = await store.lookUpPrimaryNames([address(ALICE)]);

    expect(names.get(address(ALICE).toHexString())?.toString()).toBe(
      'alice.eth',
    );
  });

  it('queries with the checksummed address and the legacy mainnet coin type', async () => {
    const { client, getEnsName } = buildClient({ [ALICE]: 'alice.eth' });
    const store = new ViemENSStore(client);

    await store.lookUpPrimaryNames([address(ALICE)]);

    expect(getEnsName).toHaveBeenCalledWith({
      address: address(ALICE).toHexString(),
      coinType: 60n,
    });
  });

  it('returns an empty map and issues no calls for no addresses', async () => {
    const { client, getEnsName } = buildClient({});
    const store = new ViemENSStore(client);

    const names = await store.lookUpPrimaryNames([]);

    expect(names.size).toBe(0);
    expect(getEnsName).not.toHaveBeenCalled();
  });
});
