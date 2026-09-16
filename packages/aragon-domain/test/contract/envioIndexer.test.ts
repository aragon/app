import { z } from 'zod';
import type { HexString } from '@/domain/primitives';
import { Address, ChainId, PageRequest } from '@/domain/primitives';
import { EnvioClient } from '@/infrastructure/stores/EnvioClient';
import {
  COUNT_BATCH_SIZE,
  EnvioMemberStore,
} from '@/infrastructure/stores/EnvioMemberStore/EnvioMemberStore';

const ENDPOINT = process.env.ENVIO_GRAPHQL_ENDPOINT;
const API_TOKEN = process.env.ENVIO_API_TOKEN;

/**
 * A live mainnet TokenVoting install with a plain ERC20Votes token and
 * delegates holding voting power: the Polygon Community Treasury DAO
 * (`ethereum-mainnet-0x86380e136A3AaD5677A210Ad02713694c4E6a5b9`).
 */
const MAINNET = 1;
const POLYGON_TREASURY_PLUGIN: HexString =
  '0xCa6f5bd946F52298a7B6154fc827bF87512a15F3';
const POLYGON_TREASURY_TOKEN: HexString =
  '0xcb8b435481dA1eD5ABC895e03535ce0Bba3b6905';

/**
 * Chain-wide id-only list of mainnet delegates, the same shape the store's
 * count batches use. Unfiltered by token so the table is as large as it
 * gets on the deployed indexer.
 */
const LIST_DELEGATE_IDS_QUERY = `
  query ListDelegateIds($chainId: Int!, $limit: Int!, $offset: Int!) {
    ERC20VotesDelegate(
      where: { chainId: { _eq: $chainId } }
      order_by: { id: asc }
      limit: $limit
      offset: $offset
    ) {
      id
    }
  }
`;

const DelegateIdsSchema = z.object({
  ERC20VotesDelegate: z.array(z.object({ id: z.string() })),
});

/**
 * Contract test against a deployed `aragon-indexer`.
 *
 * Every other test runs on canned responses, so a shape drift in the
 * deployed indexer would surface only in production. This suite sends the
 * real query documents to a live endpoint and lets the mappers' zod schemas
 * judge the response shape. The data is asserted only to be non-empty, so
 * the row schemas of both queries are actually exercised rather than
 * trivially satisfied by an empty list: an empty metrics response would
 * still parse, with every member's activity `null`, so the test also
 * requires at least one member with recorded activity.
 *
 * The member count relies on the endpoint serving a full batch of
 * `COUNT_BATCH_SIZE` ids when asked, so that a short batch is provably the
 * last one; the second test checks that invariant against the endpoint's
 * row cap.
 *
 * Excluded from `pnpm test` (see `vitest.config.ts`) and skipped unless
 * `ENVIO_GRAPHQL_ENDPOINT` (and, for a protected endpoint, `ENVIO_API_TOKEN`)
 * is set; `pnpm test:contract` runs this suite alone.
 */
describe.skipIf(ENDPOINT == null)('aragon-indexer contract', () => {
  const envio = new EnvioClient(ENDPOINT ?? '', API_TOKEN);

  it('FindDelegates and FindMemberGovernanceMetrics parse into a members page', {
    timeout: 30_000,
  }, async () => {
    const store = new EnvioMemberStore(envio);

    const page = await store.findTokenVotingMembers({
      chainId: ChainId.fromNumber(MAINNET),
      pluginAddress: Address.fromHexString(POLYGON_TREASURY_PLUGIN),
      tokenContractAddress: Address.fromHexString(POLYGON_TREASURY_TOKEN),
      page: PageRequest.create({ page: 1, pageSize: 5 }),
    });

    expect(page.items.length).toBeGreaterThan(0);
    expect(page.totalRecords).toBeGreaterThanOrEqual(page.items.length);
    expect(page.items.some(({ activity }) => activity != null)).toBe(true);
    for (const { record } of page.items) {
      expect(record.votingPower.isZero).toBe(false);
    }
  });

  it('serves a full count batch, so a short batch is the last one', {
    timeout: 30_000,
  }, async () => {
    const listIds = async (offset: number) => {
      const raw = await envio.query(LIST_DELEGATE_IDS_QUERY, {
        chainId: MAINNET,
        limit: COUNT_BATCH_SIZE,
        offset,
      });
      return DelegateIdsSchema.parse(raw).ERC20VotesDelegate;
    };

    const batch = await listIds(0);

    if (batch.length < COUNT_BATCH_SIZE) {
      // Either the table is smaller than a batch or the endpoint clamped
      // it below `COUNT_BATCH_SIZE`; only the former leaves nothing behind.
      expect(await listIds(batch.length)).toHaveLength(0);
    } else {
      expect(batch).toHaveLength(COUNT_BATCH_SIZE);
    }
  });
});
