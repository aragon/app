import { type IGetTransactionListParams, useTransactionList } from '@/modules/finance/api/financeService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { dataListUtils } from '@/shared/utils/dataListUtils';


export const useTransactionListData = (params: IGetTransactionListParams) => {
    const { t } = useTranslations();

    const {
        data: transactionListData,
        status,
        fetchStatus,
        isFetchingNextPage,
        fetchNextPage,
    } = useTransactionList(params);

    const transactionList = transactionListData?.pages.flatMap((page) => page.data);
    const state = dataListUtils.queryToDataListState({ status, fetchStatus, isFetchingNextPage });

    console.log('status', status);
    console.log('fetchStatus', fetchStatus);

    console.log('state', state);

    const pageSize = transactionListData?.pages[0].metadata.pageSize;
    const itemsCount = transactionListData?.pages[0].metadata.totalRecords;

    const errorState = {
        heading: t('app.finance.transactionList.errorState.heading'),
        description: t('app.finance.transactionList.errorState.description'),
    };

    const emptyState = {
        heading: t('app.finance.transactionList.emptyState.heading'),
        description: t('app.finance.transactionList.emptyState.description'),
    };

    return {
        onLoadMore: fetchNextPage,
        transactionList,
        state,
        pageSize,
        itemsCount,
        emptyState,
        errorState,
    };
};