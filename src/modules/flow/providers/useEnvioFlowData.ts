/**
 * Hook that assembles `IFlowDaoData` from the live capital-flow-indexer (Envio) + the
 * existing REST `/v2/dao/:id` + `/v2/policies` endpoints + linked accounts.
 *
 * Returns `{ data, isLoading, isError }` so the Flow provider can skeleton / fall back while
 * the query resolves. Only active when the `NEXT_PUBLIC_FLOW_USE_ENVIO` flag is on.
 */

import { useEffect, useMemo } from 'react';
import { useProposalList } from '@/modules/governance/api/governanceService';
import { proposalUtils } from '@/modules/governance/utils/proposalUtils';
import type { IDaoPolicy, Network } from '@/shared/api/daoService';
import { useDao, useDaoPolicies } from '@/shared/api/daoService';
import {
    flowIndexerKeys,
    isFlowIndexerEnabled,
    useFlowIndexerDaoData,
} from '@/shared/api/flowIndexer';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import type { IFlowDaoData } from '../types';
import type { ProposalByTxHash } from '../utils/envioFlowMapper';
import { buildFlowDataFromEnvio } from '../utils/envioFlowMapper';
import { buildFlowAddressBook } from '../utils/flowAddressBook';

export interface IUseEnvioFlowDataParams {
    network: string;
    addressOrEns: string;
    daoId: string;
    /**
     * When `true` the underlying indexer query polls every few seconds instead of 30s —
     * used by the FlowDataProvider while it has pending dispatches awaiting indexing.
     */
    isUrgent?: boolean;
}

export interface IUseEnvioFlowDataResult {
    enabled: boolean;
    data: IFlowDaoData | null;
    /**
     * The REST `/v2/policies` list used by the mapper. Exposed so the provider can
     * resolve `IFlowPolicy → IDaoPolicy` (needed to open the on-chain dispatch dialog).
     */
    restPolicies: readonly IDaoPolicy[];
    /**
     * React-Query key for the indexer snapshot — passed through so callers that want
     * to invalidate the cache (e.g. right after a tx broadcast) don't need to know the
     * exact parameter shape.
     */
    indexerQueryKey: ReturnType<typeof flowIndexerKeys.daoData>;
    isLoading: boolean;
    isError: boolean;
    error?: Error;
}

const getChainIdForNetwork = (network: string): number | null => {
    const def = networkDefinitions[network as Network];
    return def?.id ?? null;
};

/**
 * Composes the list of `chainId:address` keys the indexer understands for a DAO + its
 * linked accounts. Addresses are lower-cased to match how the indexer normalises them.
 */
const composeDaoIds = (
    primary: { network: string; address: string },
    linked: ReadonlyArray<{ network: string; address: string }>,
): string[] => {
    const entries = [primary, ...linked]
        .map((l) => {
            const chainId = getChainIdForNetwork(l.network);
            if (!chainId) {
                return null;
            }
            return `${chainId}:${l.address.toLowerCase()}`;
        })
        .filter((v): v is string => v !== null);
    return Array.from(new Set(entries));
};

export const useEnvioFlowData = (
    params: IUseEnvioFlowDataParams,
): IUseEnvioFlowDataResult => {
    const { network, addressOrEns, daoId, isUrgent = false } = params;
    const enabled = isFlowIndexerEnabled();

    const daoQuery = useDao({ urlParams: { id: daoId } }, { enabled });

    const dao = daoQuery.data;
    const daoNetwork = dao?.network ?? (network as Network);
    const daoAddress = dao?.address ?? '';

    const policiesQuery = useDaoPolicies(
        {
            urlParams: {
                network: daoNetwork,
                daoAddress,
            },
        },
        { enabled: enabled && Boolean(dao?.address) },
    );

    const chainId = getChainIdForNetwork(network);
    const linkedAccounts = dao?.linkedAccounts ?? [];
    const daoIds = useMemo(
        () =>
            dao
                ? composeDaoIds(
                      { network: dao.network, address: dao.address },
                      linkedAccounts,
                  )
                : [],
        [dao, linkedAccounts],
    );

    const FLOW_INDEXER_EXECUTION_LIMIT = 40;
    const indexerQuery = useFlowIndexerDaoData({
        chainId: chainId ?? 0,
        daoIds,
        executionLimit: FLOW_INDEXER_EXECUTION_LIMIT,
        enabled: enabled && daoIds.length > 0,
        isUrgent,
    });
    const indexerQueryKey = useMemo(
        () =>
            flowIndexerKeys.daoData({
                chainId: chainId ?? 0,
                daoIds,
                executionLimit: FLOW_INDEXER_EXECUTION_LIMIT,
            }),
        [chainId, daoIds],
    );

    // Pull the DAO's proposals so the mapper can enrich events/policies with a
    // proposal link. The Envio indexer never stores governance proposal data so this
    // join lives purely on the client. Backend caps `pageSize` at 50, so we ask for
    // that and let the infinite-query machinery page through the rest. This usually
    // resolves in 1-3 pages per DAO and is throwaway work once proposal attribution
    // lands in the backend.
    const PROPOSAL_PAGE_SIZE = 50;
    const proposalQuery = useProposalList(
        {
            queryParams: {
                daoId,
                pageSize: PROPOSAL_PAGE_SIZE,
                includeLinkedAccounts: true,
            },
        },
        { enabled: enabled && Boolean(daoId) },
    );

    // Greedily fetch the remaining pages so every historical proposal has a chance to
    // match an install/uninstall/exec tx hash. `fetchNextPage` is a no-op once there's
    // no more data, and React-Query dedupes concurrent fetches.
    useEffect(() => {
        if (!proposalQuery.hasNextPage) {
            return;
        }
        if (proposalQuery.isFetchingNextPage) {
            return;
        }
        void proposalQuery.fetchNextPage();
    }, [
        proposalQuery.hasNextPage,
        proposalQuery.isFetchingNextPage,
        proposalQuery.fetchNextPage,
    ]);

    // Transaction hash → { slug, proposalId }. Lower-cased keys so `lookupProposal` can
    // match without the caller having to normalise the hash. We register BOTH
    // the proposal-creation tx hash AND the proposal-execution tx hash because
    // the indexer can see either depending on the event:
    // - An INSTALLED/UNINSTALLED/dispatched event is emitted by the proposal's
    //   EXECUTION tx (when governance routes through `executeProposal`).
    // - The creation tx is the fallback when execution wasn't captured yet
    //   (e.g. direct admin plugin action that happened to create a proposal
    //   after the fact).
    const proposalByTxHash = useMemo<ProposalByTxHash>(() => {
        const map = new Map<
            string,
            { slug: string; proposalId: string; title?: string }
        >();
        if (!dao || !proposalQuery.data) {
            return map;
        }
        for (const page of proposalQuery.data.pages) {
            for (const proposal of page.data) {
                const slug = proposalUtils.getProposalSlug(proposal, dao);
                if (!slug) {
                    continue;
                }
                const title = proposal.title?.trim() || undefined;
                const attribution = { slug, proposalId: slug, title };
                if (proposal.transactionHash) {
                    map.set(
                        proposal.transactionHash.toLowerCase(),
                        attribution,
                    );
                }
                const executedHash = proposal.executed?.transactionHash;
                if (executedHash) {
                    map.set(executedHash.toLowerCase(), attribution);
                }
            }
        }
        return map;
    }, [dao, proposalQuery.data]);

    const isLoading =
        enabled &&
        (daoQuery.isLoading ||
            policiesQuery.isLoading ||
            indexerQuery.isLoading);

    const isError =
        enabled &&
        (daoQuery.isError || policiesQuery.isError || indexerQuery.isError);

    const addressBook = useMemo(
        () =>
            buildFlowAddressBook({
                dao: dao
                    ? {
                          address: dao.address,
                          name: dao.name,
                          ens: dao.ens,
                          avatar: dao.avatar,
                      }
                    : undefined,
                linkedAccounts,
                restPolicies: policiesQuery.data ?? [],
            }),
        [dao, linkedAccounts, policiesQuery.data],
    );

    const data = useMemo<IFlowDaoData | null>(() => {
        if (!enabled) {
            return null;
        }
        if (!dao || !indexerQuery.data) {
            return null;
        }
        return buildFlowDataFromEnvio({
            network,
            addressOrEns,
            daoDisplayName: dao.name ?? dao.ens ?? addressOrEns,
            indexerData: indexerQuery.data,
            restPolicies: policiesQuery.data ?? [],
            linkedAccounts,
            proposalByTxHash,
            addressBook,
        });
    }, [
        enabled,
        dao,
        indexerQuery.data,
        policiesQuery.data,
        linkedAccounts,
        network,
        addressOrEns,
        proposalByTxHash,
        addressBook,
    ]);

    const error =
        (indexerQuery.error as Error | undefined) ??
        (policiesQuery.error as Error | undefined) ??
        (daoQuery.error as Error | undefined);

    const restPolicies = policiesQuery.data ?? [];

    return {
        enabled,
        data,
        restPolicies,
        indexerQueryKey,
        isLoading,
        isError,
        error,
    };
};
