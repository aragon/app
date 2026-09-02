'use client';

import { useMemo } from 'react';
import {
    type IGetWorkspaceTransactionListParams,
    useWorkspaceTransactionList,
    workspaceFinanceService,
} from '@/modules/workspace/api/workspaceFinanceService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { dataListUtils } from '@/shared/utils/dataListUtils';

/**
 * Shapes the aggregated workspace transaction list for a `DataListRoot`.
 *
 * Each fetched page holds one response per advanced account; the merge collapses them into the prefix of the global
 * ordering that is provably complete, so "Load more" both fetches and reveals more of the list.
 */
export const useWorkspaceTransactionListData = (
    params: IGetWorkspaceTransactionListParams,
) => {
    const { queryParams } = params;
    const { daoIds, pageSize } = queryParams;

    const { t } = useTranslations();

    const { data, status, fetchStatus, isFetchingNextPage, fetchNextPage } =
        useWorkspaceTransactionList(params, { enabled: daoIds.length > 0 });

    const { transactions, totalRecords } = useMemo(
        () => workspaceFinanceService.mergeTransactionPages(data?.pages ?? []),
        [data?.pages],
    );

    const state = dataListUtils.queryToDataListState({
        status,
        fetchStatus,
        isFetchingNextPage,
    });

    const errorState = {
        heading: t('app.finance.transactionList.errorState.heading'),
        description: t('app.finance.transactionList.errorState.description'),
    };

    const emptyState = {
        heading: t('app.finance.transactionList.emptyState.heading'),
        description: t('app.finance.transactionList.emptyState.description'),
    };

    return {
        onLoadMore: fetchNextPage,
        transactions,
        state,
        pageSize,
        itemsCount: totalRecords,
        emptyState,
        errorState,
    };
};
