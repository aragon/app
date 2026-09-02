'use client';

import { useMemo, useState } from 'react';
import { assetUtils } from '@/modules/finance/utils/assetUtils';
import {
    type IGetWorkspaceAssetListParams,
    useWorkspaceAssetList,
} from '@/modules/workspace/api/workspaceFinanceService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { dataListUtils } from '@/shared/utils/dataListUtils';

export interface IUseWorkspaceAssetListDataParams
    extends IGetWorkspaceAssetListParams {
    /**
     * Number of assets to reveal per page of the client-side pagination.
     */
    pageSize: number;
}

/**
 * Shapes the aggregated workspace asset list for a `DataListRoot`.
 *
 * The underlying query drains every asset page of every account in one go, so pagination happens here rather than
 * over the network: "Load more" simply reveals the next slice of the already merged and sorted list.
 */
export const useWorkspaceAssetListData = (
    params: IUseWorkspaceAssetListDataParams,
) => {
    const { pageSize, queryParams } = params;
    const { daoIds } = queryParams;

    const { t } = useTranslations();

    // The reveal window is tied to the accounts it was opened for, so changing the aggregated accounts collapses it
    // back to a single page instead of carrying over a window sized for the previous list.
    const accountsKey = daoIds.join(',');
    const [revealed, setRevealed] = useState({
        accountsKey,
        count: pageSize,
    });
    const visibleCount =
        revealed.accountsKey === accountsKey ? revealed.count : pageSize;

    const { data, status, fetchStatus } = useWorkspaceAssetList(
        { queryParams },
        { enabled: daoIds.length > 0 },
    );

    const assetList = useMemo(
        () =>
            (data?.assets ?? [])
                .slice(0, visibleCount)
                .map((asset) => assetUtils.normalizeAsset(asset)),
        [data?.assets, visibleCount],
    );

    const state = dataListUtils.queryToDataListState({
        status,
        fetchStatus,
        isFetchingNextPage: false,
    });

    const errorState = {
        heading: t('app.finance.assetList.errorState.heading'),
        description: t('app.finance.assetList.errorState.description'),
    };

    const emptyState = {
        heading: t('app.finance.assetList.emptyState.heading'),
        description: t('app.finance.assetList.emptyState.description'),
    };

    const onLoadMore = () =>
        setRevealed({ accountsKey, count: visibleCount + pageSize });

    return {
        onLoadMore,
        assetList,
        state,
        pageSize,
        // The list is paginated client-side, so the count has to reflect what was actually fetched: reporting the
        // backend total would leave a "Load more" button that reveals nothing when the fetch cap kicked in.
        itemsCount: data?.assets.length,
        totalRecords: data?.totalRecords,
        totalAmountUsd: data?.totalAmountUsd,
        isTruncated: data?.isTruncated ?? false,
        emptyState,
        errorState,
    };
};
