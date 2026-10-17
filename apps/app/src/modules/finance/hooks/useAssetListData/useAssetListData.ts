import {
    type IGetAssetListParams,
    useAssetList,
} from '@/modules/finance/api/financeService';

import { useTranslations } from '@/shared/components/translationsProvider';
import { dataListUtils } from '@/shared/utils/dataListUtils';
import { assetUtils } from '../../utils/assetUtils';

export const useAssetListData = (params: IGetAssetListParams) => {
    const { t } = useTranslations();

    const {
        data: assetListData,
        status,
        fetchStatus,
        isFetchingNextPage,
        fetchNextPage,
    } = useAssetList(params);

    type Asset = NonNullable<
        typeof assetListData
    >['pages'][number]['data'][number];
    const assetList: Asset[] = [];

    if (assetListData?.pages) {
        for (const page of assetListData.pages) {
            for (const asset of page.data) {
                assetList.push(assetUtils.normalizeAsset(asset));
            }
        }
    }
    const state = dataListUtils.queryToDataListState({
        status,
        fetchStatus,
        isFetchingNextPage,
    });

    const pageSize =
        params.queryParams.pageSize ??
        assetListData?.pages[0].metadata.pageSize;
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
