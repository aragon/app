'use client';

import { type IGetAssetListParams } from '@/modules/finance/api/financeService';
import { useAssetListData } from '@/modules/finance/hooks/useAssetListData/useAssetListData';
import { useTranslations } from '@/shared/components/translationsProvider';
import {
    AssetDataListItem,
    AssetDataListItemStructure,
    DataListContainer,
    DataListPagination,
    DataListRoot,
} from '@aragon/ods';
import type { ComponentProps } from 'react';
import { formatUnits } from 'viem';

export interface IAssetListProps extends ComponentProps<'div'> {
    /**
     * Initial params to fetch the asset list.
     */
    initialParams: IGetAssetListParams;
    /**
     * Hides the pagination component when set to true.
     */
    hidePagination?: boolean;
}

export const AssetList: React.FC<IAssetListProps> = (props) => {
    const { initialParams, hidePagination, children, ...otherProps } = props;
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
                    <AssetDataListItemStructure
                        key={asset.token.address}
                        name={asset.token.name}
                        symbol={asset.token.symbol}
                        amount={formatUnits(BigInt(asset.amount), asset.token.decimals)}
                        fiatPrice={asset.token.priceUsd}
                        logoSrc={asset.token.logo}
                        priceChange={Number(asset.token.priceChangeOnDayUsd)}
                    />
                ))}
            </DataListContainer>
            {!hidePagination && <DataListPagination />}
            {children}
        </DataListRoot>
    );
};
