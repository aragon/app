'use client';

import { AssetDataListItem, addressUtils } from '@aragon/gov-ui-kit';
import type { ReactNode } from 'react';
import type {
    IAsset,
    IGetAssetListParams,
} from '@/modules/finance/api/financeService';
import { useAssetListData } from '@/modules/finance/hooks/useAssetListData';
import type { IDaoPlugin, IPluginSettings } from '@/shared/api/daoService';
import { DataListSelect } from '@/shared/components/dataListSelect';
import { useTranslations } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
import { AssetAddressSelectAddAddressView } from './assetAddressSelectAddAddressView';
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

export const AssetAddressSelect: React.FC<IAssetAddressSelectProps> = (
    props,
) => {
    const { initialParams, hidePagination, hasSearch, children, onAssetClick } =
        props;

    const { t } = useTranslations();

    const { network } = daoUtils.parseDaoId(initialParams.queryParams.daoId);

    const { onLoadMore, state, pageSize, itemsCount, errorState, assetList } =
        useAssetListData(initialParams);

    const filterAsset = ({ token }: IAsset, search: string) => {
        const lowerSearch = search.toLowerCase();

        return (
            token.name.toLowerCase().includes(lowerSearch) ||
            token.symbol.toLowerCase().includes(lowerSearch) ||
            (addressUtils.isAddress(search) &&
                addressUtils.isAddressEqual(token.address, search))
        );
    };

    return (
        <DataListSelect
            errorState={errorState}
            filterItem={filterAsset}
            getItemKey={(asset) => asset.token.address}
            hasSearch={hasSearch}
            hidePagination={hidePagination}
            items={assetList}
            itemsCount={itemsCount}
            labels={{
                entity: t('app.finance.assetAddressSelect.entity'),
                searchPlaceholder: t(
                    'app.finance.assetAddressSelect.searchPlaceholder',
                ),
                addAddress: t('app.finance.assetAddressSelect.addButton.label'),
                addByAddress: t(
                    'app.finance.assetAddressSelect.emptyState.addByAddress',
                ),
                emptyHeading: (search) =>
                    t('app.finance.assetAddressSelect.emptyState.heading', {
                        search,
                    }),
                emptyDescription: t(
                    'app.finance.assetAddressSelect.emptyState.description',
                ),
            }}
            onLoadMore={onLoadMore}
            pageSize={pageSize}
            renderAddressView={({ initialAddress, onBack }) => (
                <AssetAddressSelectAddAddressView
                    initialAddress={initialAddress}
                    network={network}
                    onAssetClick={onAssetClick}
                    onBack={onBack}
                />
            )}
            renderItem={(asset) => (
                <AssetAddressSelectItem
                    asset={asset}
                    onAssetClick={onAssetClick}
                />
            )}
            SkeletonElement={AssetDataListItem.Skeleton}
            state={state}
        >
            {children}
        </DataListSelect>
    );
};
