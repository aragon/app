import type { QueryClient } from '@tanstack/react-query';
import type { IDelegateStatement } from '@/modules/governance/components/delegationStatementCard/delegateStatement.api';

const MOCK_CID = 'bafyMockDelegateStatementCid';
const MOCK_GATEWAY_PATH = `/ipfs/${MOCK_CID}`;

const MOCK_STATEMENT: IDelegateStatement = {
    version: 1,
    type: 'statement',
    format: 'markdown',
    content:
        'My goal is to be an active, transparent delegate — not a passive one. I will vote on every proposal, publish my reasoning publicly, and prioritize long-term protocol health over short-term incentives. Tokenholders who delegate to me can expect consistent participation and clear communication.\n\nI care about cross-chain liquidity, governance UX, and treasury discipline. I have spent five years contributing to DeFi protocols, leading audits on two L2 rollups, and maintaining open-source tooling for delegate discovery. Outside of voting I run a public office-hours channel where I walk through every upcoming proposal in plain language and take questions from the community before each vote opens.',
};

/**
 * Seeds the TanStack Query cache with mock delegate-statement data when the
 * `useMocks` feature flag is enabled. Lets developers preview the
 * `DelegationStatementCard` read path without a real published ENS record.
 *
 * Hooks into the cache lifecycle: any query added under `delegateStatementCid`
 * is seeded with `MOCK_CID` per token, and the corresponding `ipfsJson` query
 * for that CID is seeded with `MOCK_STATEMENT`. Both seeds rely on the hooks'
 * existing `staleTime` (1h for IPFS, 5min for ENS) keeping the data fresh long
 * enough to short-circuit the network roundtrip.
 *
 * Scope: temporary scaffold for visual verification. Strip once the feature is
 * proven end-to-end on a PR preview against a real DAO with `hasDelegate=true`.
 */
export const injectDelegateStatementMock = (queryClient: QueryClient) => {
    queryClient.getQueryCache().subscribe((event) => {
        if (event.type !== 'added') {
            return;
        }
        const queryKey = event.query.queryKey as readonly unknown[];
        const [head, ...rest] = queryKey;

        if (head === 'delegateStatementCid' && rest.length > 2) {
            // queryKey shape: ['delegateStatementCid', ensName, network, ...tokenAddresses]
            const tokenAddresses = rest.slice(2) as string[];
            const data = Object.fromEntries(
                tokenAddresses.map((address) => [
                    address.toLowerCase(),
                    MOCK_CID,
                ]),
            );
            queryClient.setQueryData(queryKey, data);
            return;
        }

        if (
            head === 'ipfsJson' &&
            typeof rest[0] === 'string' &&
            rest[0].endsWith(MOCK_GATEWAY_PATH)
        ) {
            queryClient.setQueryData(queryKey, MOCK_STATEMENT);
        }
    });
};
