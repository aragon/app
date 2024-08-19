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

    if ((initialParams && byMemberAddressParams) || (!initialParams && !byMemberAddressParams)) {
        throw new Error('You cannot provide both `initialParams` and `byMemberAddressParams. You can not do both.`.');
    }

    const proposalListData = useProposalList<TProposal>(initialParams ?? { queryParams: { daoId: '' } }, {
        enabled: !!initialParams && !byMemberAddressParams,
    });

    const proposalListByMemberData = useProposalListByMemberAddress<TProposal>(
        byMemberAddressParams ?? { queryParams: { daoId: '', creatorAddress: '' } },
        {
            enabled: !!byMemberAddressParams && !initialParams,
        },
    );

    const { data, status, fetchStatus, isFetchingNextPage, fetchNextPage } = initialParams
        ? proposalListData
        : proposalListByMemberData;

    const proposalList = data?.pages.flatMap((page) => page.data) ?? [];

    const state = dataListUtils.queryToDataListState({
        status,
        fetchStatus,
        isFetchingNextPage,
    });

    const pageSize =
        initialParams?.queryParams.pageSize ??
        byMemberAddressParams?.queryParams.pageSize ??
        data?.pages[0]?.metadata.pageSize ??
        20;

    const itemsCount = data?.pages[0]?.metadata.totalRecords ?? 0;

    const errorState = {
        heading: t('app.governance.daoProposalList.error.title'),
        description: t('app.governance.daoProposalList.error.description'),
    };

    const emptyState = {
        heading: t('app.governance.daoProposalList.empty.title'),
        description: t('app.governance.daoProposalList.empty.description'),
    };

    return { proposalList, onLoadMore: fetchNextPage, state, pageSize, itemsCount, emptyState, errorState };
};
