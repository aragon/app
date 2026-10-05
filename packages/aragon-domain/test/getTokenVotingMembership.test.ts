import assert from 'node:assert';
import { createPublicClient } from 'viem';
import { buildDomain } from './support/buildDomain';
import { ALICE, BOB, CHAIN_ID, PLUGIN, TOKEN } from './support/constants';
import {
  delegate,
  delegatesResponse,
  governanceMetrics,
  governanceMetricsResponse,
} from './support/fixtures/tokenVotingMembers';

// Stubbing `createPublicClient` so we can return a fake `getEnsName`that
// we can mock.
vi.mock('viem', async (importOriginal) => ({
  ...(await importOriginal<typeof import('viem')>()),
  createPublicClient: vi.fn(),
  http: vi.fn(),
}));

function stubEnsNames(table: Record<string, string | null>) {
  const getEnsName = vi.fn(
    async ({ address }: { address: string; coinType?: bigint }) =>
      table[address.toLowerCase()] ?? null,
  );
  vi.mocked(createPublicClient).mockReturnValue({ getEnsName } as never);
  return getEnsName;
}

beforeEach(() => {
  vi.clearAllMocks();
  stubEnsNames({});
});

const request = {
  chainId: CHAIN_ID,
  pluginAddress: PLUGIN,
  tokenContractAddress: TOKEN,
  page: 1,
  pageSize: 20,
};

describe('AragonDomain.getTokenVotingMembership', () => {
  it('returns a paginated DTO of token-voting members', async () => {
    stubEnsNames({ [ALICE]: 'alice.eth' });
    const { domain } = buildDomain([
      delegatesResponse({
        delegates: [delegate(ALICE, { votingPower: '5000000000000000000' })],
      }),
      governanceMetricsResponse(),
    ]);

    const response = await domain.getTokenVotingMembership({
      ...request,
      pageSize: 15,
    });

    assert(response.success, 'expected getTokenVotingMembership to succeed');
    expect(response.result.metadata).toEqual({
      page: 1,
      pageSize: 15,
      totalPages: 1,
      totalRecords: 1,
    });
    expect(response.result.data).toHaveLength(1);
    expect(response.result.data[0]).toEqual(
      expect.objectContaining({
        ens: 'alice.eth',
        votingPower: '5000000000000000000',
        delegationCount: 1,
      }),
    );
    expect(response.result.data[0].address).toMatch(/^0x[0-9a-fA-F]{40}$/);
  });

  it('scopes both indexer queries to the requested chain', async () => {
    const { domain, query } = buildDomain([
      delegatesResponse({ delegates: [delegate(ALICE)] }),
      governanceMetricsResponse(),
    ]);

    const response = await domain.getTokenVotingMembership(request);

    assert(response.success);
    expect(query).toHaveBeenCalledTimes(2);
    expect(query).toHaveBeenNthCalledWith(
      1,
      expect.any(String),
      expect.objectContaining({
        chainId: CHAIN_ID,
        tokenContractAddress: TOKEN,
      }),
    );
    expect(query).toHaveBeenNthCalledWith(
      2,
      expect.any(String),
      expect.objectContaining({
        chainId: CHAIN_ID,
        pluginAddress: PLUGIN,
        memberAddresses: [ALICE],
      }),
    );
  });

  it('merges governance activity into the member activity window', async () => {
    const { domain } = buildDomain([
      delegatesResponse({
        delegates: [
          delegate(ALICE, {
            firstVotingPowerChangeTimestamp: '1700000000',
            lastVotingPowerChangeTimestamp: '1700000100',
          }),
        ],
      }),
      governanceMetricsResponse([
        governanceMetrics(ALICE, {
          firstActivityTimestamp: '1650000000',
          lastActivityTimestamp: '1750000000',
        }),
      ]),
    ]);

    const response = await domain.getTokenVotingMembership(request);

    assert(response.success);
    expect(response.result.data[0].firstActivityTimestamp).toBe(
      new Date(1650000000 * 1000).toISOString(),
    );
    expect(response.result.data[0].lastActivityTimestamp).toBe(
      new Date(1750000000 * 1000).toISOString(),
    );
  });

  it('attaches the primary ENS name resolved via the ENS client', async () => {
    const getEnsName = stubEnsNames({ [ALICE]: 'alice.eth' });
    const { domain } = buildDomain([
      delegatesResponse({ delegates: [delegate(ALICE), delegate(BOB)] }),
      governanceMetricsResponse(),
    ]);

    const response = await domain.getTokenVotingMembership(request);

    assert(response.success);
    // ALICE resolves; BOB has no primary name -> null.
    expect(response.result.data.map((m) => m.ens)).toEqual(['alice.eth', null]);
    expect(getEnsName).toHaveBeenCalledTimes(2);
  });

  it('reflects a larger chain-wide total in the pagination metadata', async () => {
    const { domain } = buildDomain([
      delegatesResponse({ delegates: [delegate(ALICE)], totalRecords: 42 }),
      governanceMetricsResponse(),
    ]);

    const response = await domain.getTokenVotingMembership(request);

    assert(response.success);
    expect(response.result.metadata.totalRecords).toBe(42);
    expect(response.result.metadata.totalPages).toBe(3);
  });

  it('resolves ENS out-of-band: indexer queries for data, names via the ENS client', async () => {
    const getEnsName = stubEnsNames({ [ALICE]: 'alice.eth' });
    const { domain, query } = buildDomain([
      delegatesResponse({ delegates: [delegate(ALICE)] }),
      governanceMetricsResponse(),
    ]);

    const response = await domain.getTokenVotingMembership(request);

    assert(response.success);
    expect(response.result.data[0].ens).toBe('alice.eth');
    expect(query).toHaveBeenCalledTimes(2);
    expect(getEnsName).toHaveBeenCalledTimes(1);
  });

  it('issues neither a metrics query nor ENS lookups when the page is empty', async () => {
    const getEnsName = stubEnsNames({});
    const { domain, query } = buildDomain([delegatesResponse()]);

    const response = await domain.getTokenVotingMembership(request);

    assert(response.success);
    expect(response.result.data).toHaveLength(0);
    expect(query).toHaveBeenCalledTimes(1);
    expect(getEnsName).not.toHaveBeenCalled();
  });

  it('returns a failed response for an invalid chain id', async () => {
    const { domain, query } = buildDomain([]);

    const response = await domain.getTokenVotingMembership({
      ...request,
      chainId: 0,
    });

    expect(response.success).toBe(false);
    expect(query).not.toHaveBeenCalled();
  });

  it('returns a failed response when the indexer query errors', async () => {
    // Empty queue → the store's first query throws, surfacing as a
    // failed ResultOrError rather than a rejected promise.
    const { domain } = buildDomain([]);

    const response = await domain.getTokenVotingMembership(request);

    expect(response.success).toBe(false);
  });
});
