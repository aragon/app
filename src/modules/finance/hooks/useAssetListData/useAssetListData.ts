import { type IGetAssetListParams, useAssetList } from '@/modules/finance/api/financeService';

import { useTranslations } from '@/shared/components/translationsProvider';
import { dataListUtils } from '@/shared/utils/dataListUtils';

export const useAssetListData = (params: IGetAssetListParams) => {
    const { t } = useTranslations();

    const { data: assetListData, status, fetchStatus, isFetchingNextPage, fetchNextPage } = useAssetList(params);

    const assetList = assetListData?.pages
        .flatMap((page) => page.data)
        .map((asset) => {
            const amount = asset.amount ?? '0';
            const hasAmount = asset.amount != null && Number(amount) > 0;
            const hasAmountUsd = asset.amountUsd != null && Number(asset.amountUsd) > 0;
            const price = asset.token.priceUsd;
            let derivedPrice = price;

            if ((!price || Number(price) === 0) && hasAmountUsd && hasAmount) {
                const perToken = Number(asset.amountUsd) / Number(amount);
                if (perToken > 0) {
                    derivedPrice = perToken.toString();
                }
            }

            return {
                ...asset,
                amount,
                token: {
                    ...asset.token,
                    name: asset.token.name || 'Unknown',
                    symbol: asset.token.symbol || 'UNKNOWN',
                    priceUsd: derivedPrice ?? asset.token.priceUsd ?? '0',
                },
            };
        });
    const state = dataListUtils.queryToDataListState({ status, fetchStatus, isFetchingNextPage });

    const pageSize = params.queryParams.pageSize ?? assetListData?.pages[0].metadata.pageSize;
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
