'use client';

import { type IGetAssetListParams, type IToken } from '@/modules/finance/api/financeService';
import { AssetListItem } from '@/modules/finance/components/assetList/assetListItem';
import { useAssetListData } from '@/modules/finance/hooks/useAssetListData';
import { useTranslations } from '@/shared/components/translationsProvider';
import { AssetDataListItem, DataListContainer, DataListFilter, DataListPagination, DataListRoot } from '@aragon/ods';
import { useMemo, useState, type ComponentProps } from 'react';

export interface IAssetListProps extends ComponentProps<'div'> {
    /**
     * Initial params to fetch the asset list.
     */
    initialParams: IGetAssetListParams;
    /**
     * Callback function when an asset is selected. Required if isLinking is false.
     */
    onAssetSelect: (asset: { token: IToken; amount: number | string }) => void;
}

export const AssetSelectionList: React.FC<IAssetListProps> = (props) => {
    const { initialParams, onAssetSelect, children, ...otherProps } = props;
    const [searchValue, setSearchValue] = useState<string | undefined>(undefined);

    const { t } = useTranslations();

    const { onLoadMore, state, pageSize, itemsCount, errorState, emptyState, assetList } =
        useAssetListData(initialParams);

    const filteredAssets = useMemo(() => {
        if (!assetList) return [];
        if (!searchValue) return assetList;

        const lowercasedSearchValue = searchValue.toLowerCase();

        return assetList.filter(({ token }) => token.name?.toLowerCase().includes(lowercasedSearchValue));
    }, [assetList, searchValue]);

    return (
        <DataListRoot
            entityLabel={t('app.finance.assetList.entity')}
            onLoadMore={onLoadMore}
            state={state}
            pageSize={pageSize}
            itemsCount={0}
            {...otherProps}
        >
            <DataListContainer
                SkeletonElement={AssetDataListItem.Skeleton}
                emptyState={emptyState}
                errorState={errorState}
            >
                <DataListFilter
                    onSearchValueChange={setSearchValue}
                    searchValue={searchValue}
                    placeholder={t('app.finance.assetSelectionList.searchPlaceholder')}
                />
                {filteredAssets?.map((asset, index) => (
                    <AssetListItem key={asset.token.address + index} asset={asset} onAssetClick={onAssetSelect} />
                ))}
            </DataListContainer>
            {!searchValue && <DataListPagination />}
            {children}
        </DataListRoot>
    );
};
