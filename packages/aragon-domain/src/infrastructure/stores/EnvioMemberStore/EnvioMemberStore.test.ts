import { Address, ChainId } from '@/domain/primitives';
import { PageRequest } from '@/domain/primitives/pagination/PageRequest';
import type { EnvioClient } from '@/infrastructure/stores/EnvioClient';
import { COUNT_BATCH_SIZE, EnvioMemberStore } from './EnvioMemberStore';

const PLUGIN = '0x1111111111111111111111111111111111111111';
const TOKEN = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';

const CHAIN_ID = ChainId.fromNumber(1);
const PLUGIN_ADDRESS = Address.fromHexString(PLUGIN);
const TOKEN_ADDRESS = Address.fromHexString(TOKEN);

const ALICE = '0x0123456789abcdef0123456789abcdef01234567';
const BOB = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

// Derived from the client contract so the stub cannot drift from it.
type QueryArgs = Parameters<EnvioClient['query']>;

interface QueryCall {
  document: QueryArgs[0];
  variables: QueryArgs[1];
}

interface MockClient {
  envio: EnvioClient;
  calls: QueryCall[];
}

/**
 * Builds an EnvioClient stub that returns each `response` in order for
 * the corresponding call.
 */
function buildMockEnvioClient(responses: unknown[]): MockClient {
  const calls: QueryCall[] = [];
  const queue = [...responses];
  const query: EnvioClient['query'] = async (document, variables) => {
    calls.push({ document, variables });
    return queue.shift();
  };
  const envio = { query: vi.fn(query) } as unknown as EnvioClient;
  return { envio, calls };
}

const buildDelegate = (
  address: string,
  votingPower = '5000000000000000000',
) => ({
  id: `1-${TOKEN}-${address}`,
  chainId: 1,
  tokenContractAddress: TOKEN,
  delegateAddress: address,
  votingPower,
  delegationCount: 1,
  firstVotingPowerChangeTimestamp: '1700000000',
  lastVotingPowerChangeTimestamp: '1700000100',
});

const buildMetrics = (address: string) => ({
  id: `1-${PLUGIN}-${address}`,
  chainId: 1,
  pluginAddress: PLUGIN,
  memberAddress: address,
  firstActivityTimestamp: '1650000000',
  lastActivityTimestamp: '1750000000',
});

const countBatch = (size: number) =>
  Array.from({ length: size }, (_, i) => ({ id: `total-${i}` }));

/**
 * The page query response; `counted` is the size of the bundled first
 * count batch and cannot exceed `COUNT_BATCH_SIZE`.
 */
const delegatesResponse = (
  delegates: unknown[],
  counted = delegates.length,
) => ({
  ERC20VotesDelegate: delegates,
  AllERC20VotesDelegate: countBatch(counted),
});

const countResponse = (size: number) => ({
  ERC20VotesDelegate: countBatch(size),
});

const metricsResponse = (metrics: unknown[] = []) => ({
  MemberGovernanceMetrics: metrics,
});

describe('EnvioMemberStore', () => {
  const page = PageRequest.create({ page: 2, pageSize: 20 });
  const query = {
    chainId: CHAIN_ID,
    pluginAddress: PLUGIN_ADDRESS,
    tokenContractAddress: TOKEN_ADDRESS,
    page,
  };

  it('returns a page of record/activity pairs from a delegates query and a page-sized metrics query', async () => {
    const { envio, calls } = buildMockEnvioClient([
      delegatesResponse([buildDelegate(ALICE), buildDelegate(BOB)]),
      metricsResponse(),
    ]);
    const store = new EnvioMemberStore(envio);

    const result = await store.findTokenVotingMembers(query);

    expect(result.items).toHaveLength(2);
    expect(result.page).toBe(2);
    expect(result.totalRecords).toBe(2);
    expect(calls).toHaveLength(2);
    // The metrics lookup is scoped to the addresses on this page.
    expect(calls[1].variables).toEqual({
      chainId: 1,
      pluginAddress: PLUGIN,
      memberAddresses: [ALICE, BOB],
    });
    // No governance activity for these members → null on each pair.
    expect(result.items[0].activity).toBeNull();
  });

  it('scopes the delegates query to the chain and token and pages it', async () => {
    const { envio, calls } = buildMockEnvioClient([
      delegatesResponse([buildDelegate(ALICE)]),
      metricsResponse(),
    ]);
    const store = new EnvioMemberStore(envio);

    await store.findTokenVotingMembers(query);

    expect(calls[0].variables).toEqual({
      chainId: 1,
      tokenContractAddress: TOKEN,
      limit: 20,
      offset: 20,
      countLimit: COUNT_BATCH_SIZE,
    });
    expect(calls[0].document).toContain('chainId: { _eq: $chainId }');
  });

  it('orders by voting power with the delegate address as a stable tiebreaker', async () => {
    const { envio, calls } = buildMockEnvioClient([
      delegatesResponse([buildDelegate(ALICE)]),
      metricsResponse(),
    ]);
    const store = new EnvioMemberStore(envio);

    await store.findTokenVotingMembers(query);

    expect(calls[0].document).toContain(
      'order_by: [{ votingPower: desc }, { delegateAddress: asc }]',
    );
  });

  it('pairs MemberGovernanceMetrics with the matching record by address', async () => {
    const { envio } = buildMockEnvioClient([
      delegatesResponse([buildDelegate(ALICE)]),
      metricsResponse([buildMetrics(ALICE)]),
    ]);
    const store = new EnvioMemberStore(envio);

    const result = await store.findTokenVotingMembers(query);

    const { record, activity } = result.items[0];
    expect(record.address.toHexString().toLowerCase()).toBe(ALICE);
    expect(record.firstVotingPowerChangeTimestamp).toEqual(
      new Date(1700000000 * 1000),
    );
    expect(activity?.firstGovernanceActivityTimestamp).toEqual(
      new Date(1650000000 * 1000),
    );
    expect(activity?.lastGovernanceActivityTimestamp).toEqual(
      new Date(1750000000 * 1000),
    );
  });

  it('reflects the chain-wide total in the page metadata', async () => {
    const { envio } = buildMockEnvioClient([
      delegatesResponse([buildDelegate(ALICE)], 42),
      metricsResponse(),
    ]);
    const store = new EnvioMemberStore(envio);

    const result = await store.findTokenVotingMembers(query);

    expect(result.totalRecords).toBe(42);
    expect(result.totalPages).toBe(3);
  });

  it('takes the total from the bundled count batch when it comes back short', async () => {
    const { envio, calls } = buildMockEnvioClient([
      delegatesResponse([buildDelegate(ALICE)], COUNT_BATCH_SIZE - 1),
      metricsResponse(),
    ]);
    const store = new EnvioMemberStore(envio);

    const result = await store.findTokenVotingMembers(query);

    expect(result.totalRecords).toBe(COUNT_BATCH_SIZE - 1);
    // No further count query: the page query and the metrics query only.
    expect(calls).toHaveLength(2);
  });

  it('keeps counting in batches while each one comes back full', async () => {
    const { envio, calls } = buildMockEnvioClient([
      delegatesResponse([buildDelegate(ALICE)], COUNT_BATCH_SIZE),
      countResponse(COUNT_BATCH_SIZE),
      countResponse(7),
      metricsResponse(),
    ]);
    const store = new EnvioMemberStore(envio);

    const result = await store.findTokenVotingMembers(query);

    expect(result.totalRecords).toBe(2 * COUNT_BATCH_SIZE + 7);
    expect(calls).toHaveLength(4);
    expect(calls[1].document).toContain('query CountDelegates');
    expect(calls[1].variables).toEqual({
      chainId: 1,
      tokenContractAddress: TOKEN,
      limit: COUNT_BATCH_SIZE,
      offset: COUNT_BATCH_SIZE,
    });
    expect(calls[2].variables).toMatchObject({ offset: 2 * COUNT_BATCH_SIZE });
    expect(calls[3].document).toContain('query FindMemberGovernanceMetrics');
  });

  it('skips the metrics query and returns an empty page when there are no delegates', async () => {
    const { envio, calls } = buildMockEnvioClient([delegatesResponse([])]);
    const store = new EnvioMemberStore(envio);

    const result = await store.findTokenVotingMembers(query);

    expect(result.items).toHaveLength(0);
    expect(result.totalRecords).toBe(0);
    expect(calls).toHaveLength(1);
  });

  it('wraps query failures with a member-level error', async () => {
    const envio = {
      query: vi.fn().mockRejectedValue(new Error('graphql exploded')),
    } as unknown as EnvioClient;
    const store = new EnvioMemberStore(envio);

    await expect(store.findTokenVotingMembers(query)).rejects.toThrow(
      'Error querying members from Envio',
    );
  });
});
