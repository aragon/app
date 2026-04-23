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

const FLOW_DAO_DATA_QUERY = /* GraphQL */ `
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
            }
            lastExecution {
                id
                kind
                blockNumber
                blockTimestamp
                txHash
                logIndex
                transferCount
                decodedTransferCount
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
            }
            executions(
                order_by: { blockTimestamp: desc }
                limit: $executionLimit
            ) {
                id
                kind
                blockNumber
                blockTimestamp
                txHash
                logIndex
                transferCount
                decodedTransferCount
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
