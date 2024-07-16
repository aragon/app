'use client';

import { type IGetAssetListParams } from '@/modules/finance/api/financeService';
import { useAssetListData } from '@/modules/finance/hooks/useAssetListData';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import {
    AssetDataListItem,
    AssetDataListItemStructure,
    ChainEntityType,
    DataListContainer,
    DataListPagination,
    DataListRoot,
    useBlockExplorer,
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

    const { network } = initialParams.queryParams;
    const chainId = network ? networkDefinitions[network].chainId : undefined;
    const { buildEntityUrl } = useBlockExplorer({ chainId });

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
                {assetList?.map(({ amount, token }) => (
                    <AssetDataListItemStructure
                        key={token.address}
                        name={token.name}
                        symbol={token.symbol}
                        amount={formatUnits(BigInt(amount), token.decimals)}
                        fiatPrice={token.priceUsd}
                        logoSrc={token.logo}
                        priceChange={Number(token.priceChangeOnDayUsd)}
                        target="_blank"
                        href={buildEntityUrl({ type: ChainEntityType.TOKEN, id: token.address })}
                    />
                ))}
            </DataListContainer>
            {!hidePagination && <DataListPagination />}
            {children}
        </DataListRoot>
    );
};
