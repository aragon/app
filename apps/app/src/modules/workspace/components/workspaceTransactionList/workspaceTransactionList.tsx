'use client';

import {
    AlertInline,
    DataListContainer,
    DataListPagination,
    DataListRoot,
    Toggle,
    ToggleGroup,
    TransactionDataListItem,
} from '@aragon/gov-ui-kit';
import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';
import { TransactionSide } from '@/modules/finance/api/financeService';
import { TransactionList } from '@/modules/finance/components/transactionList';
import { FinanceDialogId } from '@/modules/finance/constants/financeDialogId';
import { daoOptions, type IDao } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFilterUrlParam } from '@/shared/hooks/useFilterUrlParam';
import { dataListUtils } from '@/shared/utils/dataListUtils';
import {
    type IGetWorkspaceTransactionsFilters,
    type IGetWorkspaceTransactionsParams,
    type IWorkspaceAccountRef,
    useWorkspaceTransactions,
    WorkspaceTransactionType,
} from '../../api/workspaceQueryService';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import { workspaceUtils } from '../../utils/workspaceUtils';

enum WorkspaceTransactionListTypeFilter {
    ALL = 'all',
    EXECUTIONS = 'executions',
    RECEIVED = 'received',
    SENT = 'sent',
}

export const workspaceTransactionListTypeFilterParam = 'transactiontype';

const typeFilters = Object.values(WorkspaceTransactionListTypeFilter);

const typeFilterBody: Record<
    WorkspaceTransactionListTypeFilter,
    IGetWorkspaceTransactionsFilters
> = {
    [WorkspaceTransactionListTypeFilter.ALL]: {},
    [WorkspaceTransactionListTypeFilter.RECEIVED]: {
        side: TransactionSide.DEPOSIT,
    },
    [WorkspaceTransactionListTypeFilter.SENT]: {
        side: TransactionSide.WITHDRAW,
    },
    [WorkspaceTransactionListTypeFilter.EXECUTIONS]: {
        type: WorkspaceTransactionType.EXECUTION,
    },
};

/**
 * Parameters of the list's main query for the given type filter, "all" by default. Exposed so other components can
 * read the list's first page under the same query key, which adds no request of their own.
 */
export const buildWorkspaceTransactionListParams = (
    accounts: IWorkspaceAccountRef[],
    pageSize: number,
    filter = WorkspaceTransactionListTypeFilter.ALL,
): IGetWorkspaceTransactionsParams => ({
    body: {
        accounts,
        filters: typeFilterBody[filter],
        pagination: { pageSize },
    },
});

export interface IWorkspaceTransactionListProps {
    /**
     * Accounts to aggregate the transactions of.
     */
    accounts: IWorkspaceAccount[];
    /**
     * Number of transactions to read per page.
     */
    pageSize: number;
    /**
     * Keeps the list in its loading state while the accounts are still being resolved.
     */
    isPending?: boolean;
}

/**
 * Transactions of a set of workspace accounts, aggregated into a single list.
 *
 * It is the workspace counterpart of the finance `TransactionList`, which cannot be reused as it is: that one is
 * typed against the DAO endpoint's query parameters, whereas the workspace endpoint takes its account selection
 * and its filters in the request body.
 */
export const WorkspaceTransactionList: React.FC<
    IWorkspaceTransactionListProps
> = (props) => {
    const { accounts, pageSize, isPending } = props;

    const { t } = useTranslations();
    const { open } = useDialogContext();

    const accountRefs = accounts.map(({ network, address }) => ({
        network,
        address,
    }));
    const hasAccounts = accounts.length > 0;

    // One row is enough to know whether a type has anything to show, and the answer decides which toggles are
    // rendered, so a toggle never leads to an empty list.
    const availabilityParams = (
        filter: Exclude<
            WorkspaceTransactionListTypeFilter,
            WorkspaceTransactionListTypeFilter.ALL
        >,
    ): IGetWorkspaceTransactionsParams => ({
        body: {
            accounts: accountRefs,
            filters: typeFilterBody[filter],
            pagination: { pageSize: 1 },
        },
    });

    const receivedTransactions = useWorkspaceTransactions(
        availabilityParams(WorkspaceTransactionListTypeFilter.RECEIVED),
        { enabled: hasAccounts },
    );
    const sentTransactions = useWorkspaceTransactions(
        availabilityParams(WorkspaceTransactionListTypeFilter.SENT),
        { enabled: hasAccounts },
    );
    const executionTransactions = useWorkspaceTransactions(
        availabilityParams(WorkspaceTransactionListTypeFilter.EXECUTIONS),
        { enabled: hasAccounts },
    );

    const filterAvailability = {
        [WorkspaceTransactionListTypeFilter.RECEIVED]: {
            itemsCount:
                receivedTransactions.data?.pages[0].metadata.totalRecords,
            isError: receivedTransactions.isError,
            isPending: receivedTransactions.isPending,
        },
        [WorkspaceTransactionListTypeFilter.SENT]: {
            itemsCount: sentTransactions.data?.pages[0].metadata.totalRecords,
            isError: sentTransactions.isError,
            isPending: sentTransactions.isPending,
        },
        [WorkspaceTransactionListTypeFilter.EXECUTIONS]: {
            itemsCount:
                executionTransactions.data?.pages[0].metadata.totalRecords,
            isError: executionTransactions.isError,
            isPending: executionTransactions.isPending,
        },
    };

    const isFilterAvailabilityLoading = [
        receivedTransactions,
        sentTransactions,
        executionTransactions,
    ].some((query) => query.isPending);

    const visibleTypeFilters = dataListUtils.getVisibleFilters(
        typeFilters,
        filterAvailability,
        [WorkspaceTransactionListTypeFilter.ALL],
    );
    const availableTypes = visibleTypeFilters.filter(
        (filter) => filter !== WorkspaceTransactionListTypeFilter.ALL,
    );
    const showTypeFilters =
        !isFilterAvailabilityLoading && availableTypes.length > 1;

    const [activeTypeFilter, setActiveTypeFilter] = useFilterUrlParam({
        fallbackValue: WorkspaceTransactionListTypeFilter.ALL,
        name: workspaceTransactionListTypeFilterParam,
        validValues: visibleTypeFilters,
    });

    const { data, status, fetchStatus, isFetchingNextPage, fetchNextPage } =
        useWorkspaceTransactions(
            buildWorkspaceTransactionListParams(
                accountRefs,
                pageSize,
                activeTypeFilter as WorkspaceTransactionListTypeFilter,
            ),
            { enabled: hasAccounts },
        );

    // Execution rows need the DAO they were emitted by: it resolves the plugin name displayed on the row and is a
    // required parameter of the transaction detail dialog. A workspace account ID is already the DAO ID, so the
    // DAO accounts are fetched one by one and matched to their rows below.
    const daoQueries = useMemo(
        () =>
            accounts
                .filter((account) => account.type === WorkspaceAccountType.DAO)
                .map((account) =>
                    daoOptions(
                        { urlParams: { id: account.id } },
                        { retry: false },
                    ),
                ),
        [accounts],
    );

    const daoResults = useQueries({ queries: daoQueries });

    const daosByAccount = new Map<string, IDao>(
        daoResults
            .map((result) => result.data)
            .filter((dao) => dao != null)
            .map((dao) => [workspaceUtils.buildAccountId(dao), dao]),
    );

    const transactions = data?.pages.flatMap((page) => page.data);
    const metadata = data?.pages[0].metadata;

    // The list is incomplete as soon as one account of one loaded page could not be read in full. Saying so is what
    // stops a short list from reading as the complete history.
    const isPartial = data?.pages.some((page) => page.partial) ?? false;

    // A selection with no account keeps every query disabled, which would otherwise leave the list loading forever
    // instead of showing its empty state.
    const listState = () => {
        if (isPending) {
            return 'initialLoading';
        }

        if (!hasAccounts) {
            return 'idle';
        }

        return dataListUtils.queryToDataListState({
            status,
            fetchStatus,
            isFetchingNextPage,
        });
    };

    return (
        <DataListRoot
            entityLabel={t('app.workspace.workspaceTransactionList.entity')}
            itemsCount={metadata?.totalRecords}
            onLoadMore={fetchNextPage}
            pageSize={pageSize}
            state={listState()}
        >
            {showTypeFilters && (
                <ToggleGroup
                    isMultiSelect={false}
                    onChange={(value) => {
                        if (typeof value === 'string') {
                            setActiveTypeFilter(value);
                        }
                    }}
                    value={activeTypeFilter}
                >
                    {visibleTypeFilters.map((filter) => (
                        <Toggle
                            key={filter}
                            label={t(
                                `app.workspace.workspaceTransactionList.typeFilter.${filter}`,
                            )}
                            value={filter}
                        />
                    ))}
                </ToggleGroup>
            )}
            {isPartial && (
                <AlertInline
                    message={t(
                        'app.workspace.workspaceTransactionList.partial',
                    )}
                    variant="warning"
                />
            )}
            <DataListContainer
                emptyState={{
                    heading: t(
                        'app.workspace.workspaceTransactionList.emptyState.heading',
                    ),
                    description: t(
                        'app.workspace.workspaceTransactionList.emptyState.description',
                    ),
                }}
                errorState={{
                    heading: t(
                        'app.workspace.workspaceTransactionList.errorState.heading',
                    ),
                    description: t(
                        'app.workspace.workspaceTransactionList.errorState.description',
                    ),
                }}
                SkeletonElement={TransactionDataListItem.Skeleton}
            >
                {transactions?.map((transaction, index) => {
                    const accountId = workspaceUtils.buildAccountId(
                        transaction.account,
                    );
                    const dao = daosByAccount.get(accountId);

                    return (
                        <TransactionList.Item
                            dao={dao}
                            index={index}
                            key={`${accountId}-${transaction.id}`}
                            // Without a DAO the dialog cannot be opened, so the row stays a link to the block
                            // explorer instead of a dead click.
                            onTransactionClick={
                                dao == null
                                    ? undefined
                                    : (execution) =>
                                          open(
                                              FinanceDialogId.TRANSACTION_DETAIL,
                                              {
                                                  params: {
                                                      dao,
                                                      transaction: execution,
                                                  },
                                              },
                                          )
                            }
                            transaction={transaction}
                        />
                    );
                })}
            </DataListContainer>
            <DataListPagination />
        </DataListRoot>
    );
};
