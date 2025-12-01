'use client';

import type { IAsset, IGetAssetListParams } from '@/modules/finance/api/financeService';
import { useAssetListData } from '@/modules/finance/hooks/useAssetListData';
import type { IDaoPlugin, IPluginSettings } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import {
    AssetDataListItem,
    DataListContainer,
    DataListFilter,
    DataListPagination,
    DataListRoot,
} from '@aragon/gov-ui-kit';
import { useMemo, useState, type ReactNode } from 'react';
import { AssetListItem } from './assetListItem';

export interface IAssetListDefaultProps<TSettings extends IPluginSettings = IPluginSettings> {
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
    const { initialParams, hidePagination, hasSearch, children, onAssetClick } = props;
    const [searchValue, setSearchValue] = useState<string>();

    const { t } = useTranslations();

    const { onLoadMore, state, pageSize, itemsCount, errorState, emptyState, assetList } =
        useAssetListData(initialParams);

    if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.log('AssetListDefault: params', initialParams, 'itemsCount', itemsCount, 'sample', assetList?.[0]);
    }

    const filteredAssets = useMemo(() => {
        if (!assetList) {
            return [];
        }
        if (!hasSearch || !searchValue) {
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
            onLoadMore={onLoadMore}
            state={state}
            pageSize={pageSize}
            itemsCount={itemsCount}
        >
            {hasSearch ? (
                <DataListFilter
                    onSearchValueChange={setSearchValue}
                    searchValue={searchValue}
                    placeholder={t('app.finance.assetList.searchPlaceholder')}
                />
            ) : null}
            <DataListContainer
                SkeletonElement={AssetDataListItem.Skeleton}
                errorState={errorState}
                emptyState={emptyState}
            >
                {filteredAssets.map((asset) => (
                    <AssetListItem key={asset.token.address} asset={asset} onAssetClick={onAssetClick} />
                ))}
            </DataListContainer>
            {!hidePagination && !searchValue && <DataListPagination />}
            {children}
        </DataListRoot>
    );
};
