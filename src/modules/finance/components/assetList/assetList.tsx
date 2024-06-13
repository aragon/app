'use client';

import { useTranslations } from '@/shared/components/translationsProvider';
import { AssetDataListItemStructure, DataListContainer, DataListPagination, DataListRoot } from '@aragon/ods';
import type { ComponentProps } from 'react';
import { useBalanceList } from '../../api/financeService';

export interface IAssetListProps extends ComponentProps<'div'> {
    /**
     * Hides the pagination component when set to true.
     */
    hidePagination?: boolean;
}

export const AssetList: React.FC<IAssetListProps> = (props) => {
    const { hidePagination, children, ...otherProps } = props;

    const { t } = useTranslations();

    const { data: assetListData, fetchNextPage, isLoading } = useBalanceList({ queryParams: {} });

    const assetList = assetListData?.pages.flatMap((page) => page.data);

    return (
        <DataListRoot
            entityLabel={t('app.finance.assetList.entity')}
            onLoadMore={fetchNextPage}
            state={isLoading ? 'fetchingNextPage' : 'idle'}
            pageSize={assetListData?.pages[0].metadata.limit}
            itemsCount={assetListData?.pages[0].metadata.totRecords}
            {...otherProps}
        >
            <DataListContainer>
                {assetList?.map((asset) => (
                    <AssetDataListItemStructure
                        key={asset.address}
                        name={asset.name}
                        symbol={asset.symbol}
                        amount={asset.balance}
                        logoSrc={asset.logo}
                    />
                ))}
            </DataListContainer>
            {!hidePagination && <DataListPagination />}
            {children}
        </DataListRoot>
    );
};
