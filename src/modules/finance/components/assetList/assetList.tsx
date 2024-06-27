'use client';

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
     * ID of the DAO
     */
    daoAddress?: string;
    /**
     * Network of the DAO
     */
    network?: string;
    /**
     * Hides the pagination component when set to true.
     */
    hidePagination?: boolean;
}

export const AssetList: React.FC<IAssetListProps> = (props) => {
    const { daoAddress, network, hidePagination, children, ...otherProps } = props;
    const { t } = useTranslations();

    const queryParams = { daoAddress, network };

    const { onLoadMore, state, pageSize, itemsCount, errorState, emptyState, assetList } = useAssetListData({
        queryParams,
    });

    console.log('assetList:', assetList);

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
