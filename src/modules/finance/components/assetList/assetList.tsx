'use client';

import { type IGetAssetListParams, type IToken } from '@/modules/finance/api/financeService';
import { useAssetListData } from '@/modules/finance/hooks/useAssetListData';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import {
    AssetDataListItem,
    AssetDataListItemStructure,
    ChainEntityType,
    DataListContainer,
    DataListFilter,
    DataListPagination,
    DataListRoot,
    useBlockExplorer,
} from '@aragon/ods';
import { useEffect, useState, type ComponentProps } from 'react';

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
     * If true, items will be rendered as links.
     * If false, items will have an onClick handler instead.
     * @default true
     */
    isLinking?: boolean;
    /**
     * Callback function when an asset is selected.
     * Required if isLinking is false.
     */
    onAssetSelect?: (asset: { token: IToken; amount: number | string }) => void;
    /**
     * Shows the search input when set to true.
     * @default false
     */
    hasSearch?: boolean;
}

export const AssetList: React.FC<IAssetListProps> = (props) => {
    const {
        initialParams,
        hidePagination,
        isLinking = true,
        hasSearch = false,
        onAssetSelect,
        children,
        ...otherProps
    } = props;
    const [searchValue, setSearchValue] = useState<string | undefined>(undefined);
    const [filteredAssets, setFilteredAssets] = useState<Array<{ token: IToken; amount: number }>>([]);
    const { t } = useTranslations();
    const { buildEntityUrl } = useBlockExplorer();

    const { onLoadMore, state, pageSize, itemsCount, errorState, emptyState, assetList } =
        useAssetListData(initialParams);

    useEffect(() => {
        if (assetList) {
            let filtered = assetList;

            if (searchValue) {
                filtered = assetList.filter(({ token }) =>
                    token.name.toLowerCase().includes(searchValue.toLowerCase()),
                );
            }

            setFilteredAssets(filtered.map((asset) => ({ ...asset, amount: Number(asset.amount) })));
        }
    }, [assetList, searchValue]);

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
                {hasSearch && (
                    <DataListFilter
                        onSearchValueChange={setSearchValue}
                        searchValue={searchValue}
                        placeholder="Search assets..."
                    />
                )}
                {filteredAssets?.map(({ amount, token }) => (
                    <AssetDataListItemStructure
                        key={token.address}
                        name={token.name}
                        symbol={token.symbol}
                        amount={amount}
                        fiatPrice={token.priceUsd}
                        logoSrc={token.logo}
                        priceChange={Number(token.priceChangeOnDayUsd)}
                        target={isLinking ? '_blank' : undefined}
                        href={
                            isLinking
                                ? buildEntityUrl({
                                      type: ChainEntityType.TOKEN,
                                      id: token.address,
                                      chainId: networkDefinitions[token.network].chainId,
                                  })
                                : undefined
                        }
                        onClick={isLinking ? undefined : () => onAssetSelect?.({ token, amount })}
                    />
                ))}
            </DataListContainer>
            {!hidePagination && !searchValue && <DataListPagination />}
            {children}
        </DataListRoot>
    );
};
