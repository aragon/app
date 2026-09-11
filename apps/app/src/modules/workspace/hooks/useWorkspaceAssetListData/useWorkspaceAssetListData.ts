'use client';

import { assetUtils } from '@/modules/finance/utils/assetUtils';
import { useTranslations } from '@/shared/components/translationsProvider';
import { dataListUtils } from '@/shared/utils/dataListUtils';
import {
    type IGetWorkspaceAssetListParams,
    type IWorkspaceAsset,
    useWorkspaceAssetList,
    WorkspaceCoverageStatus,
} from '../../api/workspaceQueryService';

/**
 * Reads the aggregated assets of a workspace and shapes them for a `DataList`, mirroring `useAssetListData` of the
 * DAO pages. The rows go through the same `assetUtils.normalizeAsset` as the DAO list so that the same token never
 * shows a different price on the two tabs.
 */
export const useWorkspaceAssetListData = (
    params: IGetWorkspaceAssetListParams,
    options?: { enabled?: boolean },
) => {
    const { t } = useTranslations();

    const { data, status, fetchStatus, isFetchingNextPage, fetchNextPage } =
        useWorkspaceAssetList(params, { enabled: options?.enabled });

    const assetList: IWorkspaceAsset[] = [];

    for (const page of data?.pages ?? []) {
        for (const asset of page.data) {
            assetList.push(assetUtils.normalizeAsset(asset));
        }
    }

    const firstPage = data?.pages[0];
    const coverage = firstPage?.coverage ?? [];

    // `unverified` is the permanent state of every non-indexed account, so only an actual read failure is worth
    // warning about — see `docs/projectDocs/createWorkspace.md`.
    const unavailableAccounts = coverage.filter(
        (item) => item.status === WorkspaceCoverageStatus.UNAVAILABLE,
    );

    const state = dataListUtils.queryToDataListState({
        status,
        fetchStatus,
        isFetchingNextPage,
    });

    const errorState = {
        heading: t('app.workspace.workspaceAssetList.errorState.heading'),
        description: t(
            'app.workspace.workspaceAssetList.errorState.description',
        ),
    };

    const hasUnavailableAccounts = unavailableAccounts.length > 0;

    // An empty page with a failed source means "unknown", not "no assets".
    const emptyState = {
        heading: t(
            `app.workspace.workspaceAssetList.emptyState.${hasUnavailableAccounts ? 'unknownHeading' : 'heading'}`,
        ),
        description: t(
            `app.workspace.workspaceAssetList.emptyState.${hasUnavailableAccounts ? 'unknownDescription' : 'description'}`,
        ),
    };

    return {
        onLoadMore: fetchNextPage,
        assetList,
        state,
        pageSize:
            params.body.pagination?.pageSize ?? firstPage?.metadata.pageSize,
        itemsCount: firstPage?.metadata.totalRecords,
        metadata: firstPage?.metadata,
        unavailableAccounts,
        emptyState,
        errorState,
    };
};
