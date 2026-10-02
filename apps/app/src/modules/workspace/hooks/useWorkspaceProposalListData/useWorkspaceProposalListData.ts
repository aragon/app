'use client';

import { useTranslations } from '@/shared/components/translationsProvider';
import { dataListUtils } from '@/shared/utils/dataListUtils';
import {
    type IGetWorkspaceProposalListParams,
    type IWorkspaceProposal,
    useWorkspaceProposalList,
} from '../../api/workspaceQueryService';

export interface IUseWorkspaceProposalListDataParams {
    /**
     * Parameters of the proposal list request.
     */
    params: IGetWorkspaceProposalListParams;
    /**
     * Whether the DAOs backing the rows are still being read. The list stays in its loading state until they
     * resolve, because a proposal without its DAO cannot render a link or fall back to its slug as a title.
     */
    isDaosPending: boolean;
    /**
     * Disables the request when set to false.
     */
    enabled?: boolean;
}

/**
 * Reads the aggregated proposals of a workspace and shapes them for a `DataList`, mirroring `useProposalListData`
 * of the DAO pages.
 */
export const useWorkspaceProposalListData = (
    params: IUseWorkspaceProposalListDataParams,
) => {
    const { params: requestParams, isDaosPending, enabled } = params;

    const { t } = useTranslations();

    const { data, status, fetchStatus, isFetchingNextPage, fetchNextPage } =
        useWorkspaceProposalList(requestParams, { enabled });

    const proposalList: IWorkspaceProposal[] = [];

    for (const page of data?.pages ?? []) {
        proposalList.push(...page.data);
    }

    const firstPage = data?.pages[0];

    const listState = dataListUtils.queryToDataListState({
        status,
        fetchStatus,
        isFetchingNextPage,
    });

    // Rows are held back until their DAOs land, so an untitled proposal never renders blank and then pops in with
    // its slug, and no row is briefly unlinkable.
    const state =
        isDaosPending && listState !== 'error' ? 'initialLoading' : listState;

    const errorState = {
        heading: t('app.workspace.workspaceProposalList.errorState.heading'),
        description: t(
            'app.workspace.workspaceProposalList.errorState.description',
        ),
    };

    const emptyState = {
        heading: t('app.workspace.workspaceProposalList.emptyState.heading'),
        description: t(
            'app.workspace.workspaceProposalList.emptyState.description',
        ),
    };

    return {
        onLoadMore: fetchNextPage,
        proposalList,
        state,
        pageSize:
            requestParams.body.pagination?.pageSize ??
            firstPage?.metadata.pageSize,
        itemsCount: firstPage?.metadata.totalRecords,
        metadata: firstPage?.metadata,
        emptyState,
        errorState,
    };
};
