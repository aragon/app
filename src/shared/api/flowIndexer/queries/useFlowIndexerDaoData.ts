import { useQuery } from '@tanstack/react-query';
import { flowIndexerRequest } from '../flowIndexerClient';
import { flowIndexerKeys } from '../flowIndexerKeys';
import type { IFlowDaoDataResponse } from '../flowIndexerTypes';

/**
 * Pulls every policy + execution + transfer + recipient aggregate for the given DAO set.
 *
 * `daoIds` is the cross-product of { chainId, daoAddress }, composed client-side from the
 * primary DAO + its `linkedAccounts`. We send lower-cased `chainId:address` strings because
 * that's exactly how the indexer keys `Dao.id`.
 */

// Reusable execution fragment.  Inlined as a GraphQL fragment string because
// Envio/Hasura supports `fragment ... on Type { ... }` natively and using one
// in two places (lastExecution + executions) keeps the query short.
const EXECUTION_FIELDS = /* GraphQL */ `
    fragment ExecutionFields on PolicyExecution {
        id
        kind
        blockNumber
        blockTimestamp
        txHash
        logIndex
        transferCount
        decodedTransferCount
        strategyIndex
        skipped
        skippedReason
        strategy {
            id
            address
            kind
            index
        }
        transfers(order_by: { actionIndex: asc }) {
            id
            amount
            to
            decodedFrom
            actionIndex
            token {
                id
                address
                symbol
                decimals
            }
        }
        swapOrders(order_by: { postedAt: asc }) {
            id
            orderUid
            sellAmount
            buyAmount
            validTo
            feeAmount
            postedAt
            sellToken {
                id
                address
                symbol
                decimals
            }
            buyToken {
                id
                address
                symbol
                decimals
            }
            strategy {
                id
                address
                kind
            }
        }
    }
`;

const FLOW_DAO_DATA_QUERY = /* GraphQL */ `
    ${EXECUTION_FIELDS}
    query FlowDaoData($daoIds: [String!]!, $executionLimit: Int!) {
        Policy(where: { dao_id: { _in: $daoIds } }, order_by: { installedAt: desc }) {
            id
            pluginAddress
            strategyType
            pluginId
            pluginSetupRepo
            status
            installedAt
            installTxHash
            installBlockNumber
            totalDispatches
            lastDispatchAt
            dao {
                id
                address
                chainId
                name
                description
                avatarUrl
            }
            lastExecution {
                ...ExecutionFields
            }
            executions(
                order_by: { blockTimestamp: desc }
                limit: $executionLimit
            ) {
                ...ExecutionFields
            }
            strategies(order_by: { index: asc }) {
                id
                address
                kind
                index
                paused
                configJson
                budget {
                    id
                    address
                    kind
                    floorEpochs
                    targetEpoch
                    epochProviderAddress
                    initializedAt
                }
                gate {
                    id
                    address
                    kind
                    threshold
                    maxStaleness
                    oracle
                    baseToken
                    quoteToken
                }
                epochProvider {
                    id
                    address
                    epochLength
                }
            }
            events(order_by: { blockTimestamp: desc }, limit: 25) {
                id
                kind
                blockTimestamp
                txHash
                description
                contextJson
            }
        }
        RecipientAggregate(
            where: { dao_id: { _in: $daoIds } }
            order_by: { lastAt: desc }
            limit: 200
        ) {
            id
            recipient
            totalAmount
            transferCount
            firstAt
            lastAt
            token {
                id
                address
                symbol
                decimals
            }
            policy {
                id
                pluginAddress
                strategyType
            }
            dao {
                id
                address
            }
        }
    }
`;

export interface IUseFlowIndexerDaoDataParams {
    chainId: number;
    daoIds: string[];
    executionLimit?: number;
    enabled?: boolean;
    /**
     * When `true` the hook polls the indexer every few seconds instead of every 30s.
     * Intended for the window right after the user broadcasts an on-chain dispatch —
     * the FlowDataProvider flips this on until the tx hash lands in `executions[]`.
     */
    isUrgent?: boolean;
}

const URGENT_REFETCH_INTERVAL_MS = 3000;
const IDLE_REFETCH_INTERVAL_MS = 30_000;

export const useFlowIndexerDaoData = (params: IUseFlowIndexerDaoDataParams) => {
    const {
        chainId,
        daoIds,
        executionLimit = 40,
        enabled = true,
        isUrgent = false,
    } = params;

    return useQuery({
        queryKey: flowIndexerKeys.daoData({ chainId, daoIds, executionLimit }),
        queryFn: ({ signal }) =>
            flowIndexerRequest<
                IFlowDaoDataResponse,
                { daoIds: string[]; executionLimit: number }
            >(FLOW_DAO_DATA_QUERY, { daoIds, executionLimit }, { signal }),
        enabled: enabled && daoIds.length > 0,
        staleTime: isUrgent ? 0 : 15_000,
        refetchInterval: isUrgent
            ? URGENT_REFETCH_INTERVAL_MS
            : IDLE_REFETCH_INTERVAL_MS,
    });
};
