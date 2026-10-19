'use client';

import { assetUtils } from '@/modules/finance/utils/assetUtils';
import { useTranslations } from '@/shared/components/translationsProvider';
import { dataListUtils } from '@/shared/utils/dataListUtils';
import {
    type IGetWorkspaceAssetListParams,
    type IWorkspaceAsset,
    useWorkspaceAssetList,
} from '../../api/workspaceQueryService';
import { workspaceCoverageUtils } from '../../utils/workspaceCoverageUtils';

export interface IUseWorkspaceAssetListDataOptions {
    /**
     * Whether the asset query runs. A selection holding no account keeps it disabled.
     */
    enabled?: boolean;
    /**
     * Whether a single account is in view, which the empty copy then names instead of the accounts of the
     * workspace. Resolved by the caller, which also renders the `unavailable` copy off the same flag, so the two
     * cannot describe different selections.
     */
    isSingleAccount?: boolean;
}

/**
 * Reads the aggregated assets of a workspace and shapes them for a `DataList`, mirroring `useAssetListData` of the
 * DAO pages. The rows go through the same `assetUtils.normalizeAsset` as the DAO list so that the same token never
 * shows a different price on the two tabs.
 */
export const useWorkspaceAssetListData = (
    params: IGetWorkspaceAssetListParams,
    options?: IUseWorkspaceAssetListDataOptions,
) => {
    const { t } = useTranslations();

    const { enabled, isSingleAccount } = options ?? {};

    const { data, status, fetchStatus, isFetchingNextPage, fetchNextPage } =
        useWorkspaceAssetList(params, { enabled });

    const assetList: IWorkspaceAsset[] = [];

    for (const page of data?.pages ?? []) {
        for (const asset of page.data) {
            assetList.push(assetUtils.normalizeAsset(asset));
        }
    }

    const firstPage = data?.pages[0];

    // Named for the copy it drives (`workspaceAssetList.unavailable.*`); `workspaceCoverageUtils` owns which
    // statuses count as unreadable, and why.
    const unavailableAccounts = workspaceCoverageUtils.getUnreadableAccounts(
        firstPage?.coverage,
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

    // An empty page with a failed source means "unknown", not "no assets". With every source read, the copy still
    // does not claim the accounts hold nothing: the aggregation returns no row for sources it does not cover yet,
    // a Safe among them (see `docs/projectDocs/createWorkspace.md`), so it only says what the list will show once
    // the assets are available — the same promise the transaction list makes, named per scope the same way.
    const emptyDescriptionKey = () => {
        if (hasUnavailableAccounts) {
            return 'unknownDescription';
        }

        return isSingleAccount ? 'descriptionSingle' : 'description';
    };

    const emptyState = {
        heading: t(
            `app.workspace.workspaceAssetList.emptyState.${hasUnavailableAccounts ? 'unknownHeading' : 'heading'}`,
        ),
        description: t(
            `app.workspace.workspaceAssetList.emptyState.${emptyDescriptionKey()}`,
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
