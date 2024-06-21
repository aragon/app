import { useTranslations } from '@/shared/components/translationsProvider';
import { dataListUtils } from '@/shared/utils/dataListUtils';
import { useMemberList, type IGetMemberListParams, type IMember } from '../../api/governanceService';

export const useMemberListData = <TMember extends IMember = IMember>(params: IGetMemberListParams) => {
    const { t } = useTranslations();

    const {
        data: memberListData,
        status,
        fetchStatus,
        isFetchingNextPage,
        fetchNextPage,
    } = useMemberList<TMember>(params);

    const memberList = memberListData?.pages.flatMap((page) => page.data);
    const state = dataListUtils.queryToDataListState({ status, fetchStatus, isFetchingNextPage });

    const pageSize = memberListData?.pages[0].metadata.pageSize;
    const itemsCount = memberListData?.pages[0].metadata.totalRecords;

    const errorState = {
        heading: t('app.governance.daoMemberList.error.title'),
        description: t('app.governance.daoMemberList.error.description'),
    };

    const emptyState = {
        heading: t('app.governance.daoMemberList.empty.title'),
        description: t('app.governance.daoMemberList.empty.description'),
    };

    return {
        onLoadMore: fetchNextPage,
        memberList,
        state,
        pageSize,
        itemsCount,
        emptyState,
        errorState,
    };
};
