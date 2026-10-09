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
     * Whether the page is scoped to a single account, which the empty and error copy then names instead of the
     * workspace it belongs to.
     */
    isAccountScoped?: boolean;
}

/**
 * Reads the aggregated proposals of a workspace and shapes them for a `DataList`, mirroring `useProposalListData`
 * of the DAO pages.
 *
 * The request is disabled when the selection holds no account, which is also the one state the data list cannot be
 * told from a loading one: that decision stays here rather than with the caller so the two cannot drift apart.
 */
export const useWorkspaceProposalListData = (
    params: IUseWorkspaceProposalListDataParams,
) => {
    const { params: requestParams, isDaosPending, isAccountScoped } = params;

    const { t } = useTranslations();

    const hasAccounts = requestParams.body.accounts.length > 0;

    const { data, status, fetchStatus, isFetchingNextPage, fetchNextPage } =
        useWorkspaceProposalList(requestParams, { enabled: hasAccounts });

    const proposalList: IWorkspaceProposal[] = [];

    for (const page of data?.pages ?? []) {
        proposalList.push(...page.data);
    }

    const firstPage = data?.pages[0];

    // A process tab narrows the rows, so an empty result is "nothing matched" rather than "nothing exists" — the
    // data list tells the two apart through its filtered state.
    const hasFilters = requestParams.body.filters != null;

    // A selection with no account keeps the query disabled, and a disabled query reads as pending, which would
    // otherwise leave the list loading forever instead of showing its empty state. Rows are held back until their
    // DAOs land, so an untitled proposal never renders blank and then pops in with its slug, and no row is
    // briefly unlinkable.
    const listState = () => {
        if (!hasAccounts) {
            return 'idle';
        }

        const queryState = dataListUtils.queryToDataListState({
            status,
            fetchStatus,
            isFetchingNextPage,
            hasFilters,
        });

        if (isDaosPending && queryState !== 'error') {
            return 'initialLoading';
        }

        return queryState;
    };

    // An account scope is the account, so the copy names it instead of the workspace it belongs to. It follows the
    // route rather than the number of accounts in view: a workspace holding a single DAO still presents itself as
    // the workspace on its aggregated route, down to the title of the aside card beside this list.
    const descriptionKey = isAccountScoped
        ? 'descriptionSingle'
        : 'description';

    const errorState = {
        heading: t('app.workspace.workspaceProposalList.errorState.heading'),
        description: t(
            `app.workspace.workspaceProposalList.errorState.${descriptionKey}`,
        ),
    };

    const emptyState = {
        heading: t('app.workspace.workspaceProposalList.emptyState.heading'),
        description: t(
            `app.workspace.workspaceProposalList.emptyState.${descriptionKey}`,
        ),
    };

    const emptyFilteredState = {
        heading: t(
            'app.workspace.workspaceProposalList.emptyFilteredState.heading',
        ),
        description: t(
            'app.workspace.workspaceProposalList.emptyFilteredState.description',
        ),
    };

    return {
        onLoadMore: fetchNextPage,
        proposalList,
        state: listState(),
        pageSize:
            requestParams.body.pagination?.pageSize ??
            firstPage?.metadata.pageSize,
        itemsCount: firstPage?.metadata.totalRecords,
        metadata: firstPage?.metadata,
        emptyState,
        emptyFilteredState,
        errorState,
    };
};
