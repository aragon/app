import { useTranslations } from '@/shared/components/translationsProvider';
import { dataListUtils } from '@/shared/utils/dataListUtils';
import { useProposalList, type IGetProposalListParams, type IProposal } from '../../api/governanceService';

export const useProposalListData = <TProposal extends IProposal = IProposal>(params: IGetProposalListParams) => {
    const { t } = useTranslations();

    const {
        data: proposalListData,
        status,
        fetchStatus,
        isFetchingNextPage,
        fetchNextPage,
    } = useProposalList<TProposal>(params);

    const proposalList = proposalListData?.pages.flatMap((page) => page.data);
    const state = dataListUtils.queryToDataListState({ status, fetchStatus, isFetchingNextPage });

    const pageSize = params.queryParams.pageSize ?? proposalListData?.pages[0].metadata.pageSize;
    const itemsCount = proposalListData?.pages[0].metadata.totalRecords;

    const errorState = {
        heading: t('app.governance.daoProposalList.error.title'),
        description: t('app.governance.daoProposalList.error.description'),
    };

    const emptyState = {
        heading: t('app.governance.daoProposalList.empty.title'),
        description: t('app.governance.daoProposalList.empty.description'),
    };

    return {
        onLoadMore: fetchNextPage,
        proposalList,
        state,
        pageSize,
        itemsCount,
        emptyState,
        errorState,
    };
};
