'use client';

import { AssetDataListItem, addressUtils } from '@aragon/gov-ui-kit';
import type { ReactNode } from 'react';
import type {
    IAsset,
    IGetAssetListParams,
} from '@/modules/finance/api/financeService';
import { useAssetListData } from '@/modules/finance/hooks/useAssetListData';
import { useSafeAssetListData } from '@/modules/finance/hooks/useSafeAssetListData';
import type {
    IDaoPlugin,
    IPluginSettings,
    Network,
} from '@/shared/api/daoService';
import {
    DataListSelect,
    type IDataListSelectProps,
} from '@/shared/components/dataListSelect';
import { useTranslations } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
import type { AssetListParams, ISafeAssetListSource } from '../../types';
import { assetUtils } from '../../utils/assetUtils';
import { AssetAddressSelectAddAddressView } from './assetAddressSelectAddAddressView';
import { AssetAddressSelectItem } from './assetAddressSelectItem';

export interface IAssetAddressSelectProps<
    TSettings extends IPluginSettings = IPluginSettings,
> {
    /**
     * Initial parameters to use for fetching the asset list: the assets of a DAO, or the balances of a Safe.
     */
    initialParams: AssetListParams;
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

type IAssetAddressSelectViewProps = Omit<
    IAssetAddressSelectProps,
    'initialParams'
>;

interface IAssetAddressSelectListProps
    extends IAssetAddressSelectViewProps,
        Pick<
            IDataListSelectProps<IAsset>,
            'state' | 'itemsCount' | 'pageSize' | 'onLoadMore' | 'errorState'
        > {
    /**
     * Network of the listed assets, used to look up an asset added by address.
     */
    network: Network;
    /**
     * Assets to choose from.
     */
    assetList: IAsset[];
}

const AssetAddressSelectList: React.FC<IAssetAddressSelectListProps> = (
    props,
) => {
    const {
        network,
        assetList,
        state,
        itemsCount,
        pageSize,
        onLoadMore,
        errorState,
        hidePagination,
        hasSearch,
        children,
        onAssetClick,
    } = props;

    const { t } = useTranslations();

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

interface IAssetAddressSelectDaoProps extends IAssetAddressSelectViewProps {
    /**
     * Parameters for fetching the indexed assets of the DAO.
     */
    initialParams: IGetAssetListParams;
}

const AssetAddressSelectDao: React.FC<IAssetAddressSelectDaoProps> = (
    props,
) => {
    const { initialParams, ...otherProps } = props;

    const { network } = daoUtils.parseDaoId(initialParams.queryParams.daoId);
    const assetListData = useAssetListData(initialParams);

    return (
        <AssetAddressSelectList
            network={network}
            {...assetListData}
            {...otherProps}
        />
    );
};

interface IAssetAddressSelectSafeProps extends IAssetAddressSelectViewProps {
    /**
     * Safe to list the balances of.
     */
    safe: ISafeAssetListSource;
}

const AssetAddressSelectSafe: React.FC<IAssetAddressSelectSafeProps> = (
    props,
) => {
    const { safe, ...otherProps } = props;

    const assetListData = useSafeAssetListData(safe);

    return (
        <AssetAddressSelectList
            network={safe.network}
            {...assetListData}
            {...otherProps}
        />
    );
};

export const AssetAddressSelect: React.FC<IAssetAddressSelectProps> = (
    props,
) => {
    const { initialParams, ...otherProps } = props;

    // Each source reads its own query, so it renders a component of its own rather than calling a hook conditionally.
    if (assetUtils.isSafeAssetListParams(initialParams)) {
        return (
            <AssetAddressSelectSafe safe={initialParams.safe} {...otherProps} />
        );
    }

    return (
        <AssetAddressSelectDao initialParams={initialParams} {...otherProps} />
    );
};
