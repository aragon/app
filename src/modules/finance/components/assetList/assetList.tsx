'use client';

import type { IAsset, IGetAssetListParams } from '@/modules/finance/api/financeService';
import { useAssetListData } from '@/modules/finance/hooks/useAssetListData';
import { useTranslations } from '@/shared/components/translationsProvider';
import { AssetDataListItem, DataListContainer, DataListPagination, DataListRoot } from '@aragon/ods';
import type { ComponentProps } from 'react';
import { AssetListItem } from './assetListItem';

export interface IAssetListProps extends ComponentProps<'div'> {
    /**
     * Initial params to fetch the asset list.
     */
    initialParams: IGetAssetListParams;
    /**
     * Hides the pagination component when set to true.
     */
    hidePagination?: boolean;
    /**
     * Callback called on token click. Replaces the default link to the token block-explorer page when set.
     */
    onAssetClick?: (asset: IAsset) => void;
}

export const AssetList: React.FC<IAssetListProps> = (props) => {
    const { initialParams, hidePagination, children, onAssetClick, ...otherProps } = props;

    const { t } = useTranslations();

    const { onLoadMore, state, pageSize, itemsCount, errorState, emptyState, assetList } =
        useAssetListData(initialParams);

    return (
        <DataListRoot
            entityLabel={t('app.finance.assetList.entity')}
            onLoadMore={onLoadMore}
            state={state}
            pageSize={pageSize}
            itemsCount={itemsCount}
            {...otherProps}
        >
            <DataListContainer
                SkeletonElement={AssetDataListItem.Skeleton}
                emptyState={emptyState}
                errorState={errorState}
            >
                {assetList?.map((asset) => (
                    <AssetListItem key={asset.token.address} asset={asset} onAssetClick={onAssetClick} />
                ))}
            </DataListContainer>
            {!hidePagination && <DataListPagination />}
            {children}
        </DataListRoot>
    );
};
