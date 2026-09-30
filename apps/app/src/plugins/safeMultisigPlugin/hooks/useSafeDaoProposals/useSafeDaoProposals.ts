'use client';

import { useQuery } from '@tanstack/react-query';
import {
    type ISafeMultisigTransaction,
    type ISafeQueueResponse,
    safeQueryGcTime,
    safeService,
    safeServiceKeys,
} from '@/shared/api/safeService';
import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import { safeBodyPollInterval, safeQueueReadLimit } from '../../constants';
import { safeDaoProposalUtils } from '../../utils/safeDaoProposalUtils';
import { safeMultisigProposalUtils } from '../../utils/safeMultisigProposalUtils';
import type {
    ISafeDaoProposal,
    ISafeDaoProposalsData,
    IUseSafeDaoProposalsParams,
    IUseSafeDaoProposalsReturn,
} from './useSafeDaoProposals.api';

const readLimit = safeQueueReadLimit;

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

export const readSafeTransactions = async (
    params: IReadSafeTransactionsParams,
): Promise<ISafeMultisigTransaction[]> => {
    const result = await readSafeTransactionPages(params);

    if (result.partial) {
        throw new Error('Safe transaction response was incomplete');
    }

    return result.transactions;
};

const readDaoProposals = async (
    params: IUseSafeDaoProposalsParams,
): Promise<ISafeDaoProposalsData> => {
    const { network, safeAddress, daoAddress } = params;
    const urlParams = { network, address: safeAddress };
    const [safeInfo, transactionPages] = await Promise.all([
        safeService.getSafeInfo({ urlParams }),
        readSafeTransactionPages({ network, safeAddress }),
    ]);

    const currentNonce = safeInfo.nonce;
    const proposalsByHash = new Map<string, ISafeDaoProposal>();

    for (const transaction of transactionPages.transactions) {
        const actions = safeDaoProposalUtils.findDaoExecuteActions({
            transaction,
            daoAddress,
        });

        if (actions == null) {
            continue;
        }

        const state = safeMultisigProposalUtils.getTransactionState({
            transaction,
            currentNonce,
        });

        proposalsByHash.set(transaction.safeTxHash.toLowerCase(), {
            transaction,
            actions,
            state,
            status: safeMultisigProposalUtils.getTransactionStatus({
                transaction,
                currentNonce,
            }),
        });
    }

    return {
        safeInfo,
        proposals: [...proposalsByHash.values()],
        meta: {
            stale: safeInfo.meta.stale || transactionPages.stale,
            partial: transactionPages.partial,
        },
    };
};

export const safeDaoProposalsOptions = (
    params: IUseSafeDaoProposalsParams,
    options?: QueryOptions<ISafeDaoProposalsData>,
): SharedQueryOptions<ISafeDaoProposalsData> => {
    const { network, safeAddress, daoAddress, enabled = true } = params;

    return {
        queryKey: safeServiceKeys.safeDaoProposals({
            network,
            safeAddress,
            daoAddress,
        }),
        queryFn: () => readDaoProposals(params),
        enabled,
        gcTime: safeQueryGcTime,
        refetchInterval: safeBodyPollInterval,
        ...options,
    };
};

export const useSafeDaoProposals = (
    params: IUseSafeDaoProposalsParams,
): IUseSafeDaoProposalsReturn => {
    const { data, isPending, isError, error } = useQuery(
        safeDaoProposalsOptions(params),
    );

    return {
        data,
        isLoading: params.enabled !== false && isPending,
        isError,
        error: error instanceof Error ? error : null,
        isStale: data?.meta.stale === true,
        isPartial: data?.meta.partial === true,
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
