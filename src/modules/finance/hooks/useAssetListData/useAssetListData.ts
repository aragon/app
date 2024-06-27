import { type IGetAssetListParams, useAssetList } from '@/modules/finance/api/financeService';

import { useTranslations } from '@/shared/components/translationsProvider';
import { dataListUtils } from '@/shared/utils/dataListUtils';


export const useAssetListData = (params: IGetAssetListParams) => {
    const { t } = useTranslations();
    console.log('params:', params)
    const {
        data: assetListData,
        status,
        fetchStatus,
        isFetchingNextPage,
        fetchNextPage,
    } = useAssetList(params);

    const assetList = assetListData?.pages.flatMap((page) => page.data);
    const state = dataListUtils.queryToDataListState({ status, fetchStatus, isFetchingNextPage });

    const pageSize = assetListData?.pages[0].metadata.pageSize;
    const itemsCount = assetListData?.pages[0].metadata.totalRecords;

    const errorState = {
        heading: t('app.finance.assetList.errorState.heading'),
        description: t('app.finance.assetList.errorState.description'),
    };

    const emptyState = {
        heading: t('app.finance.assetList.emptyState.heading'),
        description: t('app.finance.assetList.emptyState.description'),
    };

    return {
        onLoadMore: fetchNextPage,
        assetList,
        state,
        pageSize,
        itemsCount,
        emptyState,
        errorState,
    };
};