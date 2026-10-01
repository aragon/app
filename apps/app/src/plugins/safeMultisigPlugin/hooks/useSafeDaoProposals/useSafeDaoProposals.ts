'use client';

import { ProposalStatus } from '@aragon/gov-ui-kit';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
    type ISafeInfoResponse,
    type ISafeMultisigTransaction,
    type ISafeQueueResponse,
    type ISafeStoredTransaction,
    type ISafeStoredTransactionsResponse,
    SafeStoredTransactionState,
    safeQueryGcTime,
    safeService,
    safeServiceKeys,
} from '@/shared/api/safeService';
import type {
    InfiniteQueryOptions,
    SharedInfiniteQueryOptions,
} from '@/shared/types';
import { safeBodyPollInterval, safeQueueReadLimit } from '../../constants';
import { SafeTransactionState } from '../../types';
import { safeDaoProposalUtils } from '../../utils/safeDaoProposalUtils';
import { safeMultisigProposalUtils } from '../../utils/safeMultisigProposalUtils';
import type {
    ISafeDaoProposal,
    ISafeDaoProposalsData,
    IUseSafeDaoProposalParams,
    IUseSafeDaoProposalReturn,
    IUseSafeDaoProposalsParams,
    IUseSafeDaoProposalsReturn,
} from './useSafeDaoProposals.api';

const readLimit = safeQueueReadLimit;
type StoredPageParam = number | string;
const maxStoredOffset = 10_000;

const getStoredNextOffset = (
    next: string | null,
    currentOffset: unknown,
): number | undefined => {
    if (next == null) {
        return undefined;
    }

    const current = Number(currentOffset);
    const offset = Number(next);

    if (
        !Number.isInteger(current) ||
        !Number.isInteger(offset) ||
        offset < 0 ||
        offset > maxStoredOffset ||
        offset <= current
    ) {
        return undefined;
    }

    return offset;
};

const hasStoredPaginationError = (
    pages: ISafeStoredTransactionsResponse[] | undefined,
    pageParams: unknown[] | undefined,
): boolean =>
    pages?.some(
        (page, index) =>
            page.next != null &&
            getStoredNextOffset(page.next, pageParams?.[index] ?? 0) == null,
    ) ?? false;

interface ReadPagesResult {
    transactions: ISafeQueueResponse['results'];
    stale: boolean;
    partial: boolean;
}

type ReadPage = (offset: number) => Promise<ISafeQueueResponse>;

const readAllPages = async (readPage: ReadPage): Promise<ReadPagesResult> => {
    const transactions: ISafeQueueResponse['results'] = [];
    let stale = false;
    let offset = 0;

    while (true) {
        const response = await readPage(offset);
        transactions.push(...response.results);
        stale ||= response.meta.stale;

        const nextOffset = offset + response.results.length;

        if (nextOffset > response.count) {
            return { transactions, stale, partial: true };
        }

        if (nextOffset === response.count) {
            return { transactions, stale, partial: false };
        }

        if (response.next == null || response.results.length === 0) {
            return { transactions, stale, partial: true };
        }

        offset = nextOffset;
    }
};

export interface IReadSafeTransactionsParams {
    network: IUseSafeDaoProposalsParams['network'];
    safeAddress: string;
}

const readSafeTransactionPages = async ({
    network,
    safeAddress,
}: IReadSafeTransactionsParams): Promise<ReadPagesResult> => {
    const urlParams = { network, address: safeAddress };
    const [queuedTransactions, executedTransactions] = await Promise.all([
        readAllPages((offset) =>
            safeService.getSafePendingTransactions({
                urlParams,
                queryParams: { limit: readLimit, offset },
            }),
        ),
        readAllPages((offset) =>
            safeService.getSafeTransactionHistory({
                urlParams,
                queryParams: { limit: readLimit, offset },
            }),
        ),
    ]);

    return {
        transactions: [
            ...queuedTransactions.transactions,
            ...executedTransactions.transactions,
        ],
        stale: queuedTransactions.stale || executedTransactions.stale,
        partial: queuedTransactions.partial || executedTransactions.partial,
    };
};

/**
 * Live queue/history read retained for signing reconciliation. Stored reads are eventual and must
 * not replace this fresh verification path.
 */
export const readSafeTransactions = async (
    params: IReadSafeTransactionsParams,
): Promise<ISafeMultisigTransaction[]> => {
    const result = await readSafeTransactionPages(params);

    if (result.partial) {
        throw new Error('Safe transaction response was incomplete');
    }

    return result.transactions;
};

const getStoredProposalState = (
    transaction: ISafeStoredTransaction,
    currentNonce: string,
): SafeTransactionState => {
    if (transaction.state === SafeStoredTransactionState.EXECUTED) {
        return SafeTransactionState.EXECUTED;
    }

    if (
        transaction.state === SafeStoredTransactionState.SUPERSEDED ||
        transaction.state === SafeStoredTransactionState.REMOVED
    ) {
        return SafeTransactionState.SUPERSEDED;
    }

    return safeMultisigProposalUtils.getTransactionState({
        transaction,
        currentNonce,
    });
};

const buildDaoProposalsData = (
    safeInfo: ISafeInfoResponse | undefined,
    pages: ISafeStoredTransactionsResponse[] | undefined,
    daoAddress: string,
): ISafeDaoProposalsData | undefined => {
    if (safeInfo == null || pages == null || pages.length === 0) {
        return undefined;
    }

    const proposalsByHash = new Map<string, ISafeDaoProposal>();

    for (const transaction of pages.flatMap((page) => page.results)) {
        const actions = safeDaoProposalUtils.findDaoExecuteActions({
            transaction,
            daoAddress,
        });

        if (actions == null) {
            continue;
        }

        const state = getStoredProposalState(transaction, safeInfo.nonce);
        const status =
            state === SafeTransactionState.EXECUTED
                ? ProposalStatus.EXECUTED
                : state === SafeTransactionState.SUPERSEDED
                  ? ProposalStatus.EXPIRED
                  : safeMultisigProposalUtils.getTransactionStatus({
                        transaction,
                        currentNonce: safeInfo.nonce,
                    });
        proposalsByHash.set(transaction.safeTxHash.toLowerCase(), {
            transaction,
            actions,
            state,
            status,
        });
    }

    const fetchedAt = pages.some((page) => page.meta.fetchedAt == null)
        ? null
        : (pages.at(-1)?.meta.fetchedAt ?? null);

    return {
        safeInfo,
        proposals: [...proposalsByHash.values()],
        meta: {
            stale: safeInfo.meta.stale || pages.some((page) => page.meta.stale),
            partial: pages.some((page) => page.meta.partial),
            fetchedAt,
        },
    };
};

export const safeDaoProposalsOptions = (
    params: IUseSafeDaoProposalsParams,
    options?: InfiniteQueryOptions<
        ISafeStoredTransactionsResponse,
        StoredPageParam
    >,
): SharedInfiniteQueryOptions<
    ISafeStoredTransactionsResponse,
    StoredPageParam
> => {
    const { network, safeAddress, daoAddress, enabled = true } = params;
    const urlParams = { network, address: safeAddress };

    return {
        queryKey: safeServiceKeys.safeDaoProposals({
            network,
            safeAddress,
            daoAddress,
        }),
        queryFn: ({ pageParam }) =>
            safeService.getSafeStoredTransactions({
                urlParams,
                queryParams: {
                    limit: readLimit,
                    offset: pageParam,
                    to: daoAddress,
                },
            }),
        initialPageParam: 0,
        getNextPageParam: (lastPage, _allPages, lastPageParam) => {
            const nextOffset = getStoredNextOffset(
                lastPage.next,
                lastPageParam,
            );

            return nextOffset == null ? undefined : String(nextOffset);
        },
        enabled,
        gcTime: safeQueryGcTime,
        refetchInterval: safeBodyPollInterval,
        ...options,
    };
};

const safeInfoOptions = (params: IUseSafeDaoProposalsParams) => {
    const hasSafeAddress = params.safeAddress.length > 0;

    return {
        queryKey: hasSafeAddress
            ? safeServiceKeys.safeInfo({
                  urlParams: {
                      network: params.network,
                      address: params.safeAddress,
                  },
              })
            : ['SAFE_INFO_DISABLED', params.network],
        queryFn: () =>
            safeService.getSafeInfo({
                urlParams: {
                    network: params.network,
                    address: params.safeAddress,
                },
            }),
        enabled: params.enabled !== false && hasSafeAddress,
        gcTime: safeQueryGcTime,
        refetchInterval: safeBodyPollInterval,
    };
};

export const useSafeDaoProposals = (
    params: IUseSafeDaoProposalsParams,
): IUseSafeDaoProposalsReturn => {
    const safeInfoQuery = useQuery(safeInfoOptions(params));
    const storedQuery = useInfiniteQuery(safeDaoProposalsOptions(params));
    const data = buildDaoProposalsData(
        safeInfoQuery.data,
        storedQuery.data?.pages,
        params.daoAddress,
    );
    const isError = safeInfoQuery.isError || storedQuery.isError;
    const error = safeInfoQuery.error ?? storedQuery.error;
    const isIndexing =
        params.enabled !== false &&
        (data?.meta.fetchedAt == null ||
            data?.meta.stale === true ||
            data?.meta.partial === true ||
            storedQuery.isFetchNextPageError ||
            hasStoredPaginationError(
                storedQuery.data?.pages,
                storedQuery.data?.pageParams,
            ));

    return {
        data,
        isLoading:
            params.enabled !== false &&
            (safeInfoQuery.isPending || storedQuery.isPending),
        isError,
        error: error instanceof Error ? error : null,
        isStale: data?.meta.stale === true,
        isPartial: data?.meta.partial === true,
        isIndexing,
        fetchNextPage: storedQuery.fetchNextPage,
        hasNextPage: storedQuery.hasNextPage === true,
        isFetchingNextPage: storedQuery.isFetchingNextPage,
        isFetchNextPageError: storedQuery.isFetchNextPageError,
    };
};
interface StoredProposalLookup {
    transaction?: ISafeStoredTransaction;
    stale: boolean;
    partial: boolean;
    fetchedAt: string | null;
    paginationError: boolean;
    complete: boolean;
}

type StoredProposalSummary = Omit<StoredProposalLookup, 'complete'>;

const isCompleteStoredLookup = ({
    stale,
    partial,
    fetchedAt,
    paginationError,
}: StoredProposalSummary): boolean =>
    !stale && !partial && fetchedAt != null && !paginationError;

const readStoredProposal = async (
    params: IUseSafeDaoProposalParams,
): Promise<StoredProposalLookup> => {
    const states: Array<SafeStoredTransactionState | undefined> = [
        undefined,
        SafeStoredTransactionState.SUPERSEDED,
        SafeStoredTransactionState.REMOVED,
    ];
    let stale = false;
    let partial = false;
    let fetchedAt: string | null = null;
    let hasFetchedAt = false;
    let paginationError = false;

    for (const state of states) {
        let offset: StoredPageParam = 0;

        while (true) {
            const page = await safeService.getSafeStoredTransactions({
                urlParams: {
                    network: params.network,
                    address: params.safeAddress,
                },
                queryParams: {
                    limit: readLimit,
                    offset,
                    to: params.daoAddress,
                    ...(state == null ? {} : { state }),
                },
            });

            stale ||= page.meta.stale;
            partial ||= page.meta.partial;

            if (!hasFetchedAt) {
                fetchedAt = page.meta.fetchedAt;
                hasFetchedAt = true;
            } else if (fetchedAt !== null && page.meta.fetchedAt !== null) {
                fetchedAt = page.meta.fetchedAt;
            } else {
                fetchedAt = null;
            }

            const transaction = page.results.find(
                ({ safeTxHash }) =>
                    safeTxHash.toLowerCase() ===
                    params.safeTxHash.toLowerCase(),
            );

            if (transaction != null) {
                const lookup = {
                    transaction,
                    stale,
                    partial,
                    fetchedAt,
                    paginationError,
                };

                return {
                    ...lookup,
                    complete: isCompleteStoredLookup(lookup),
                };
            }

            const nextOffset = getStoredNextOffset(page.next, offset);

            if (page.next != null && nextOffset == null) {
                paginationError = true;
                break;
            }

            if (nextOffset == null) {
                break;
            }

            offset = String(nextOffset);
        }
    }

    const lookup = {
        stale,
        partial,
        fetchedAt,
        paginationError,
    };

    return {
        ...lookup,
        complete: isCompleteStoredLookup(lookup),
    };
};

export const useSafeDaoProposal = (
    params: IUseSafeDaoProposalParams,
): IUseSafeDaoProposalReturn => {
    const safeInfoQuery = useQuery(safeInfoOptions(params));
    const lookupQuery = useQuery({
        queryKey: safeServiceKeys.safeDaoProposal({
            network: params.network,
            safeAddress: params.safeAddress,
            daoAddress: params.daoAddress,
            safeTxHash: params.safeTxHash,
        }),
        queryFn: () => readStoredProposal(params),
        enabled: params.enabled !== false && params.safeTxHash.length > 0,
        gcTime: safeQueryGcTime,
        refetchInterval: safeBodyPollInterval,
    });
    const data =
        safeInfoQuery.data == null || lookupQuery.data == null
            ? undefined
            : buildDaoProposalsData(
                  safeInfoQuery.data,
                  [
                      {
                          count: lookupQuery.data.transaction == null ? 0 : 1,
                          next: null,
                          previous: null,
                          results:
                              lookupQuery.data.transaction == null
                                  ? []
                                  : [lookupQuery.data.transaction],
                          meta: {
                              source: 'store',
                              fetchedAt: lookupQuery.data.fetchedAt,
                              stale: lookupQuery.data.stale,
                              partial: lookupQuery.data.partial,
                          },
                      },
                  ],
                  params.daoAddress,
              );
    const isError = safeInfoQuery.isError || lookupQuery.isError;
    const error = safeInfoQuery.error ?? lookupQuery.error;
    const isIndexing =
        !isError &&
        params.enabled !== false &&
        lookupQuery.data != null &&
        !lookupQuery.data.complete;
    const proposal = data?.proposals[0];

    return {
        data,
        isLoading:
            params.enabled !== false &&
            (safeInfoQuery.isPending || lookupQuery.isPending),
        isError,
        error: error instanceof Error ? error : null,
        isStale: data?.meta.stale === true,
        isPartial: data?.meta.partial === true,
        isIndexing,
        isNotFound:
            params.enabled !== false &&
            !isError &&
            lookupQuery.data?.complete === true &&
            proposal == null,
    };
};

export const findSafeDaoProposal = (
    proposals: ISafeDaoProposal[] | undefined,
    safeTxHash: string,
): ISafeDaoProposal | undefined =>
    proposals?.find(
        ({ transaction }) =>
            transaction.safeTxHash.toLowerCase() === safeTxHash.toLowerCase(),
    );
