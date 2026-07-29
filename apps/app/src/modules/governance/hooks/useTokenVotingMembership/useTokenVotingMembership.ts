import { useInfiniteQuery } from '@tanstack/react-query';
import {
    type IGetMemberListParams,
    tokenVotingMembershipOptions,
} from '@/modules/governance/api/governanceService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { dataListUtils } from '@/shared/utils/dataListUtils';

/**
 * Token-voting member list data hook. Wraps the dedicated
 * `getTokenVotingMembership` fetch (subdomain-vs-backend routing + backend→DTO
 * map) and exposes the same data-list interface the token member list
 * consumes — the list items are `TokenVotingMemberDTO`.
 */
export const useTokenVotingMembership = (params: IGetMemberListParams) => {
    const { t } = useTranslations();

    const {
        data: membershipData,
        status,
        fetchStatus,
        isFetchingNextPage,
        fetchNextPage,
    } = useInfiniteQuery(tokenVotingMembershipOptions(params));

    const memberList = membershipData?.pages.flatMap((page) => page.data);
    const state = dataListUtils.queryToDataListState({
        status,
        fetchStatus,
        isFetchingNextPage,
    });

    const pageSize =
        params.queryParams.pageSize ??
        membershipData?.pages[0].metadata.pageSize;
    const itemsCount = membershipData?.pages[0].metadata.totalRecords;

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
