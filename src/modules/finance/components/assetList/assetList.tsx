'use client';

import type { IAsset, IGetAssetListParams } from '@/modules/finance/api/financeService';
import { useAssetListData } from '@/modules/finance/hooks/useAssetListData';
import { useTranslations } from '@/shared/components/translationsProvider';
import { AssetDataListItem, DataListContainer, DataListFilter, DataListPagination, DataListRoot } from '@aragon/ods';
import { useMemo, useState, type ComponentProps } from 'react';
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
     * hasSearch is a boolean that is used to determine if the search bar should be displayed or not.
     */
    hasSearch?: boolean;
    /**
     * Callback called on token click. Replaces the default link to the token block-explorer page when set.
     */
    onAssetClick?: (asset: IAsset) => void;
}

export const AssetList: React.FC<IAssetListProps> = (props) => {
    const { initialParams, hidePagination, hasSearch, children, onAssetClick, ...otherProps } = props;
    const [searchValue, setSearchValue] = useState<string>();

    const { t } = useTranslations();

    const { onLoadMore, state, pageSize, itemsCount, errorState, emptyState, assetList } =
        useAssetListData(initialParams);

    const filteredAssets = useMemo(() => {
        if (!assetList) {
            return [];
        }
        if (!hasSearch || !searchValue) {
            return assetList;
        }

        const lowercasedSearchValue = searchValue.toLowerCase();

        return assetList.filter(({ token }) => {
            const tokenName = token.name?.toLowerCase() || '';
            const tokenSymbol = token.symbol?.toLowerCase() || '';
            return tokenName.includes(lowercasedSearchValue) || tokenSymbol.includes(lowercasedSearchValue);
        });
    }, [assetList, searchValue, hasSearch]);

    return (
        <DataListRoot
            entityLabel={t('app.finance.assetList.entity')}
            onLoadMore={onLoadMore}
            state={state}
            pageSize={pageSize}
            itemsCount={itemsCount}
            {...otherProps}
        >
            {hasSearch ? (
                <DataListFilter
                    onSearchValueChange={setSearchValue}
                    searchValue={searchValue}
                    placeholder={t('app.finance.assetSelectionList.searchPlaceholder')}
                />
            ) : null}
            <DataListContainer
                SkeletonElement={AssetDataListItem.Skeleton}
                emptyState={emptyState}
                errorState={errorState}
            >
                {filteredAssets?.map((asset) => (
                    <AssetListItem key={asset.token.address} asset={asset} onAssetClick={onAssetClick} />
                ))}
            </DataListContainer>
            {!hidePagination && !searchValue && <DataListPagination />}
            {children}
        </DataListRoot>
    );
};
