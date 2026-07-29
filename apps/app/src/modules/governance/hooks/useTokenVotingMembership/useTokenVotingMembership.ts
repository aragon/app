import type { PageDTO, TokenVotingMemberDTO } from '@aragon/aragon-domain';
import { useInfiniteQuery } from '@tanstack/react-query';
import {
    type IGetTokenVotingMembershipParams,
    tokenVotingMembershipOptions,
} from '@/modules/governance/api/governanceService';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { InfiniteQueryOptions } from '@/shared/types';
import { dataListUtils } from '@/shared/utils/dataListUtils';

/**
 * Token-voting member list data hook. Wraps the dedicated
 * `getTokenVotingMembership` fetch (domain-vs-backend routing + backend→DTO
 * map) and exposes the same data-list interface the token member list
 * consumes — the list items are `TokenVotingMemberDTO`.
 */
export const useTokenVotingMembership = (
    params: IGetTokenVotingMembershipParams,
    options?: InfiniteQueryOptions<
        PageDTO<TokenVotingMemberDTO>,
        IGetTokenVotingMembershipParams
    >,
) => {
    const { t } = useTranslations();

    const {
        data: membershipData,
        status,
        fetchStatus,
        isFetchingNextPage,
        fetchNextPage,
    } = useInfiniteQuery(tokenVotingMembershipOptions(params, options));

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
