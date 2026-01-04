'use client';

import {
    AssetDataListItem,
    DataListContainer,
    DataListFilter,
    DataListPagination,
    DataListRoot,
} from '@aragon/gov-ui-kit';
import { type ReactNode, useMemo, useState } from 'react';
import type {
    IAsset,
    IGetAssetListParams,
} from '@/modules/finance/api/financeService';
import { useAssetListData } from '@/modules/finance/hooks/useAssetListData';
import type { IDaoPlugin, IPluginSettings } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { AssetListItem } from './assetListItem';

export interface IAssetListDefaultProps<
    TSettings extends IPluginSettings = IPluginSettings,
> {
    /**
     * Initial parameters to use for fetching the asset list.
     */
    initialParams: IGetAssetListParams;
    /**
     * DAO plugin (SubDAO) to display assets for.
     */
    plugin?: IDaoPlugin<TSettings>;
    /**
     * Callback called on asset click. Replaces the default link to the block-explorer when set.
     */
    onAssetClick?: (asset: IAsset) => void;
    /**
     * Hides the pagination when set to true.
     */
    hidePagination?: boolean;
    /**
     * hasSearch is a boolean that is used to determine if the search bar should be displayed or not.
     */
    hasSearch?: boolean;
    /**
     * Children of the component.
     */
    children?: ReactNode;
}

export const AssetListDefault: React.FC<IAssetListDefaultProps> = (props) => {
    const { initialParams, hidePagination, hasSearch, children, onAssetClick } =
        props;
    const [searchValue, setSearchValue] = useState<string>();

    const { t } = useTranslations();

    const {
        onLoadMore,
        state,
        pageSize,
        itemsCount,
        errorState,
        emptyState,
        assetList,
    } = useAssetListData(initialParams);

    const filteredAssets = useMemo(() => {
        if (!(hasSearch && searchValue)) {
            return assetList;
        }

        return assetList.filter(({ token }) => {
            const tokenName = token.name.toLowerCase();
            const tokenSymbol = token.symbol.toLowerCase();

            return [tokenName, tokenSymbol].includes(searchValue.toLowerCase());
        });
    }, [assetList, searchValue, hasSearch]);

    return (
        <DataListRoot
            entityLabel={t('app.finance.assetList.entity')}
            itemsCount={itemsCount}
            onLoadMore={onLoadMore}
            pageSize={pageSize}
            state={state}
        >
            {hasSearch ? (
                <DataListFilter
                    onSearchValueChange={setSearchValue}
                    placeholder={t('app.finance.assetList.searchPlaceholder')}
                    searchValue={searchValue}
                />
            ) : null}
            <DataListContainer
                emptyState={emptyState}
                errorState={errorState}
                SkeletonElement={AssetDataListItem.Skeleton}
            >
                {filteredAssets.map((asset, index) => (
                    <AssetListItem
                        asset={asset}
                        key={`${asset.token.address}-${index.toString()}`}
                        onAssetClick={onAssetClick}
                    />
                ))}
            </DataListContainer>
            {!(hidePagination || searchValue) && <DataListPagination />}
            {children}
        </DataListRoot>
    );
};
