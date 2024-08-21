import { useTranslations } from '@/shared/components/translationsProvider';
import { dataListUtils } from '@/shared/utils/dataListUtils';
import { useVoteList, type IGetVoteListParams, type IVote } from '../../api/governanceService';

export const useVoteListData = <TVote extends IVote = IVote>(params: IGetVoteListParams) => {
    const { t } = useTranslations();

    const { data, status, fetchStatus, isFetchingNextPage, fetchNextPage } = useVoteList<TVote>(params);

    const voteList = data?.pages.flatMap((page) => page.data);
    const state = dataListUtils.queryToDataListState({ status, fetchStatus, isFetchingNextPage });

    const pageSize = params.queryParams.pageSize ?? data?.pages[0].metadata.pageSize;

    const itemsCount = data?.pages[0].metadata.totalRecords;

    const errorState = {
        heading: t('app.governance.voteList.error.title'),
        description: t('app.governance.voteList.error.description'),
    };

    const emptyState = {
        heading: t('app.governance.voteList.empty.title'),
        description: t('app.governance.voteList.empty.description'),
    };

    return {
        onLoadMore: fetchNextPage,
        voteList,
        state,
        pageSize,
        itemsCount,
        emptyState,
        errorState,
    };
};
