'use client';

import { useTranslations } from '@/shared/components/translationsProvider';
import { AssetDataListItemStructure, DataListContainer, DataListPagination, DataListRoot } from '@aragon/ods';
import { useBalanceList } from '../../api/financeService';

export interface IAssetListProps {}

export const AssetList: React.FC<IAssetListProps> = () => {
    const { t } = useTranslations();

    const { data: assetListData, fetchNextPage, isLoading } = useBalanceList({ queryParams: {} });

    const assetList = assetListData?.pages.flatMap((page) => page.data);

    return (
        <DataListRoot
            entityLabel={t('app.finance.assetList.entity')}
            onLoadMore={fetchNextPage}
            state={isLoading ? 'fetchingNextPage' : 'idle'}
            pageSize={assetListData?.pages[0].limit}
            itemsCount={assetListData?.pages[0].totRecords}
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
            <DataListPagination />
        </DataListRoot>
    );
};
