import { useTranslations } from '@/shared/components/translationsProvider';
import { dataListUtils } from '@/shared/utils/dataListUtils';
import { type IGetMemberLocksParams, useMemberLocks } from '../../api/tokenService';

export const useTokenLockListData = (params: IGetMemberLocksParams) => {
    const { t } = useTranslations();

    const { data, status, fetchStatus, isFetchingNextPage, fetchNextPage } = useMemberLocks(params);

    const locksList = data?.pages.flatMap((page) => page.data);

    const state = dataListUtils.queryToDataListState({
        status,
        fetchStatus,
        isFetchingNextPage,
    });

    const pageSize = params.queryParams.pageSize ?? data?.pages[0].metadata.pageSize;

    const itemsCount = data?.pages[0].metadata.totalRecords;

    const errorState = {
        heading: t('app.plugins.token.tokenLockList.error.title'),
        description: t('app.plugins.token.tokenLockList.error.description'),
    };

    const emptyState = {
        heading: t('app.plugins.token.tokenLockList.empty.title'),
        description: t('app.plugins.token.tokenLockList.empty.description'),
    };

    return { locksList, onLoadMore: fetchNextPage, state, pageSize, itemsCount, emptyState, errorState };
};
