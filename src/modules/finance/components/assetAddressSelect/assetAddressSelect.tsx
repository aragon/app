'use client';

import {
    AssetDataListItem,
    addressUtils,
    DataListContainer,
    DataListFilter,
    DataListPagination,
    DataListRoot,
    IconType,
} from '@aragon/gov-ui-kit';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import type { Hex } from 'viem';
import type {
    IAsset,
    IGetAssetListParams,
} from '@/modules/finance/api/financeService';
import { useAssetListData } from '@/modules/finance/hooks/useAssetListData';
import type { IDaoPlugin, IPluginSettings } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
import { AssetAddressSelectAddAddressView } from './assetAddressSelectAddAddressView';
import { AssetAddressSelectAddButton } from './assetAddressSelectAddButton';
import { AssetAddressSelectItem } from './assetAddressSelectItem';

export interface IAssetAddressSelectProps<
    TSettings extends IPluginSettings = IPluginSettings,
> {
    /**
     * Initial parameters to use for fetching the asset list.
     */
    initialParams: IGetAssetListParams;
    /**
     * DAO plugin (linked account) to display assets for.
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

type AssetAddressSelectMode = 'list' | 'addAddress';

export const AssetAddressSelect: React.FC<IAssetAddressSelectProps> = (
    props,
) => {
    const { initialParams, hidePagination, hasSearch, children, onAssetClick } =
        props;
    const [searchValue, setSearchValue] = useState<string>();
    const [mode, setMode] = useState<AssetAddressSelectMode>('list');
    const [pendingAddress, setPendingAddress] = useState<Hex | undefined>();

    const { t } = useTranslations();

    const { network } = daoUtils.parseDaoId(initialParams.queryParams.daoId);

    const { onLoadMore, state, pageSize, itemsCount, errorState, assetList } =
        useAssetListData(initialParams);

    const handleOpenAddAddress = () => setMode('addAddress');
    const handleBack = () => {
        setPendingAddress(undefined);
        setMode('list');
    };

    const filteredAssets = useMemo(() => {
        if (!(hasSearch && searchValue)) {
            return assetList;
        }

        const lowerSearch = searchValue.toLowerCase();
        const searchIsAddress = addressUtils.isAddress(searchValue);

        return assetList.filter(({ token }) => {
            const nameHit = token.name.toLowerCase().includes(lowerSearch);
            const symbolHit = token.symbol.toLowerCase().includes(lowerSearch);
            const addrHit =
                searchIsAddress &&
                addressUtils.isAddressEqual(token.address, searchValue);
            return nameHit || symbolHit || addrHit;
        });
    }, [assetList, searchValue, hasSearch]);

    useEffect(() => {
        if (mode !== 'list') {
            return;
        }
        if (!searchValue || !addressUtils.isAddress(searchValue)) {
            return;
        }
        if (filteredAssets.length > 0) {
            return;
        }

        setPendingAddress(searchValue as Hex);
        setSearchValue(undefined);
        setMode('addAddress');
    }, [mode, searchValue, filteredAssets.length]);

    if (mode === 'addAddress') {
        return (
            <AssetAddressSelectAddAddressView
                initialAddress={pendingAddress}
                network={network}
                onAssetClick={onAssetClick}
                onBack={handleBack}
            />
        );
    }

    const emptyState = {
        heading: t('app.finance.assetAddressSelect.emptyState.heading', {
            search: searchValue ?? '',
        }),
        description: t('app.finance.assetAddressSelect.emptyState.description'),
        primaryButton: {
            label: t('app.finance.assetAddressSelect.emptyState.addByAddress'),
            iconLeft: IconType.PLUS,
            onClick: handleOpenAddAddress,
        },
    };

    return (
        <DataListRoot
            entityLabel={t('app.finance.assetAddressSelect.entity')}
            itemsCount={itemsCount}
            onLoadMore={onLoadMore}
            pageSize={pageSize}
            state={state}
        >
            {hasSearch ? (
                <DataListFilter
                    onSearchValueChange={setSearchValue}
                    placeholder={t(
                        'app.finance.assetAddressSelect.searchPlaceholder',
                    )}
                    searchValue={searchValue}
                />
            ) : null}
            {filteredAssets.length > 0 && (
                <AssetAddressSelectAddButton onClick={handleOpenAddAddress} />
            )}
            <DataListContainer
                emptyState={emptyState}
                errorState={errorState}
                SkeletonElement={AssetDataListItem.Skeleton}
            >
                {filteredAssets.map((asset, index) => (
                    <AssetAddressSelectItem
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
