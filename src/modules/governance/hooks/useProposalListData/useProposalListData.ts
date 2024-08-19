import { type IGetProposalListByMemberAddressParams } from '@/shared/api/daoService';
import { useProposalListByMemberAddress } from '@/shared/api/daoService/queries/useProposalListByMemberAddress';
import { useTranslations } from '@/shared/components/translationsProvider';
import { dataListUtils } from '@/shared/utils/dataListUtils';
import { useProposalList, type IGetProposalListParams, type IProposal } from '../../api/governanceService';

export const useProposalListData = <TProposal extends IProposal = IProposal>(
    initialParams?: IGetProposalListParams,
    byMemberAddressParams?: IGetProposalListByMemberAddressParams,
) => {
    const { t } = useTranslations();

    if (initialParams && byMemberAddressParams) {
        throw new Error('You cannot provide both `initialParams` and `byMemberAddressParams`.');
    }
    if (!initialParams && !byMemberAddressParams) {
        throw new Error('You must provide either `initialParams` or `byMemberAddressParams`.');
    }

    const {
        data: proposalListData = { pages: [] },
        status: proposalListStatus,
        fetchStatus: proposalListFetchStatus,
        isFetchingNextPage: proposalListIsFetchingNextPage,
        fetchNextPage: fetchNextPageProposalList,
    } = useProposalList<TProposal>(initialParams ?? { queryParams: { daoId: '' } }, {
        enabled: !!initialParams && !byMemberAddressParams,
    });

    const {
        data: proposalListByMemberData = { pages: [] },
        status: proposalListByMemberStatus,
        fetchStatus: proposalListByMemberFetchStatus,
        isFetchingNextPage: proposalListByMemberIsFetchingNextPage,
        fetchNextPage: fetchNextPageProposalListByMember,
    } = useProposalListByMemberAddress<TProposal>(
        byMemberAddressParams ?? { queryParams: { daoId: '', creatorAddress: '' } },
        {
            enabled: !!byMemberAddressParams && !initialParams,
        },
    );

    const proposalList = initialParams
        ? proposalListData?.pages.flatMap((page) => page.data)
        : proposalListByMemberData?.pages.flatMap((page) => page.data);

    const state = dataListUtils.queryToDataListState({
        status: initialParams ? proposalListStatus : proposalListByMemberStatus,
        fetchStatus: initialParams ? proposalListFetchStatus : proposalListByMemberFetchStatus,
        isFetchingNextPage: initialParams ? proposalListIsFetchingNextPage : proposalListByMemberIsFetchingNextPage,
    });

    const pageSize =
        initialParams?.queryParams.pageSize ??
        proposalListData?.pages[0]?.metadata.pageSize ??
        byMemberAddressParams?.queryParams.pageSize ??
        proposalListByMemberData?.pages[0]?.metadata.pageSize;

    const itemsCount =
        proposalListData?.pages[0]?.metadata.totalRecords ?? proposalListByMemberData?.pages[0]?.metadata.totalRecords;

    const errorState = {
        heading: t('app.governance.daoProposalList.error.title'),
        description: t('app.governance.daoProposalList.error.description'),
    };

    const emptyState = {
        heading: t('app.governance.daoProposalList.empty.title'),
        description: t('app.governance.daoProposalList.empty.description'),
    };

    return {
        onLoadMore: initialParams ? fetchNextPageProposalList : fetchNextPageProposalListByMember,
        proposalList,
        state,
        pageSize,
        itemsCount,
        emptyState,
        errorState,
    };
};
