'use client';

import {
    AlertCard,
    AssetDataListItem,
    DataListContainer,
    DataListPagination,
    DataListRoot,
} from '@aragon/gov-ui-kit';
import { AssetList } from '@/modules/finance/components/assetList';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IWorkspaceAccountRef } from '../../api/workspaceQueryService';
import { useWorkspaceAssetListData } from '../../hooks/useWorkspaceAssetListData';

export interface IWorkspaceAssetListProps {
    /**
     * Accounts to aggregate the assets of.
     */
    accounts: IWorkspaceAccountRef[];
    /**
     * Number of assets to read per page.
     */
    pageSize: number;
}

/**
 * Aggregated asset list of a workspace, laid out like `AssetList.Default` of the DAO pages and reusing its row: a
 * workspace asset satisfies `IAsset`, because the backend projects the same nested token.
 */
export const WorkspaceAssetList: React.FC<IWorkspaceAssetListProps> = (
    props,
) => {
    const { accounts, pageSize } = props;

    const { t } = useTranslations();

    const {
        onLoadMore,
        assetList,
        state,
        itemsCount,
        unavailableAccounts,
        emptyState,
        errorState,
    } = useWorkspaceAssetListData(
        { body: { accounts, pagination: { pageSize } } },
        { enabled: accounts.length > 0 },
    );

    return (
        <div className="flex flex-col gap-4 md:gap-6">
            {unavailableAccounts.length > 0 && (
                <AlertCard
                    message={t(
                        'app.workspace.workspaceAssetList.unavailable.title',
                    )}
                    variant="warning"
                >
                    {t(
                        'app.workspace.workspaceAssetList.unavailable.description',
                        {
                            count: unavailableAccounts.length,
                        },
                    )}
                </AlertCard>
            )}
            <DataListRoot
                entityLabel={t('app.workspace.workspaceAssetList.entity')}
                itemsCount={itemsCount}
                onLoadMore={onLoadMore}
                pageSize={pageSize}
                state={state}
            >
                <DataListContainer
                    emptyState={emptyState}
                    errorState={errorState}
                    SkeletonElement={AssetDataListItem.Skeleton}
                >
                    {assetList.map((asset) => (
                        <AssetList.Item
                            asset={asset}
                            key={`${asset.network}-${asset.tokenAddress}`}
                        />
                    ))}
                </DataListContainer>
                <DataListPagination />
            </DataListRoot>
        </div>
    );
};
