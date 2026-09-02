'use client';

import {
    AssetDataListItem,
    DataListContainer,
    DataListPagination,
    DataListRoot,
} from '@aragon/gov-ui-kit';
import { AssetListItem } from '@/modules/finance/components/assetList';
import { useWorkspaceAssetListData } from '@/modules/workspace/hooks/useWorkspaceAssetListData';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface IWorkspaceAssetListProps {
    /**
     * IDs of the DAOs to aggregate the assets of.
     */
    daoIds: string[];
    /**
     * Number of assets to reveal per page.
     */
    pageSize: number;
}

/**
 * Asset list aggregated across every account of a workspace.
 *
 * Single-account views reuse `AssetList.Default` instead, since one account maps to one backend query.
 */
export const WorkspaceAssetList: React.FC<IWorkspaceAssetListProps> = (
    props,
) => {
    const { daoIds, pageSize } = props;

    const { t } = useTranslations();

    const { onLoadMore, assetList, state, itemsCount, emptyState, errorState } =
        useWorkspaceAssetListData({ queryParams: { daoIds }, pageSize });

    return (
        <DataListRoot
            entityLabel={t('app.finance.assetList.entity')}
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
                    <AssetListItem
                        asset={asset}
                        key={`${asset.daoId}-${asset.token.address}`}
                    />
                ))}
            </DataListContainer>
            <DataListPagination />
        </DataListRoot>
    );
};
