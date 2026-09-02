'use client';

import {
    DataListContainer,
    DataListPagination,
    DataListRoot,
    Toggle,
    ToggleGroup,
    TransactionDataListItem,
} from '@aragon/gov-ui-kit';
import type { ITransactionExecution } from '@/modules/finance/api/financeService';
import {
    TransactionListItem,
    TransactionListTypeFilter,
    transactionListTypeFilterParam,
    transactionListTypeFilters,
    transactionListTypeQueryParams,
} from '@/modules/finance/components/transactionList';
import { useWorkspaceTransactionAvailability } from '@/modules/workspace/api/workspaceFinanceService';
import type { IWorkspaceAccount } from '@/modules/workspace/api/workspaceService';
import { useWorkspaceAccountDaos } from '@/modules/workspace/hooks/useWorkspaceAccountDaos';
import { useWorkspaceTransactionListData } from '@/modules/workspace/hooks/useWorkspaceTransactionListData';
import type { IDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFilterUrlParam } from '@/shared/hooks/useFilterUrlParam';
import { dataListUtils } from '@/shared/utils/dataListUtils';

export interface IWorkspaceTransactionListProps {
    /**
     * Accounts of the workspace to aggregate the transactions of.
     */
    accounts: IWorkspaceAccount[];
    /**
     * Number of transactions to request per page from each account.
     */
    pageSize: number;
    /**
     * Callback called on execution transaction click, with the DAO the transaction was fetched for.
     */
    onTransactionClick?: (
        transaction: ITransactionExecution,
        dao?: IDao,
    ) => void;
}

/**
 * Transaction list aggregated across every account of a workspace.
 *
 * Single-account views reuse `TransactionList.Default` instead, since one account maps to one backend query. The type
 * filter mirrors that component's, down to the URL parameter, so the selection survives switching accounts.
 */
export const WorkspaceTransactionList: React.FC<
    IWorkspaceTransactionListProps
> = (props) => {
    const { accounts, pageSize, onTransactionClick } = props;

    const { t } = useTranslations();

    const { accountDaos } = useWorkspaceAccountDaos({ accounts });

    const daoIds = accountDaos.map(({ account }) => account.id);

    // Transactions are attributed to the account they were fetched for, which is what resolves the DAO used to label
    // executions and to open the detail dialog. A parent account's children report the parent's ID, so this always
    // resolves to a workspace account.
    const daoById = new Map(
        accountDaos.map(({ account, dao }) => [account.id, dao]),
    );

    const received = useWorkspaceTransactionAvailability({
        queryParams: {
            daoIds,
            ...transactionListTypeQueryParams[
                TransactionListTypeFilter.RECEIVED
            ],
        },
    });
    const sent = useWorkspaceTransactionAvailability({
        queryParams: {
            daoIds,
            ...transactionListTypeQueryParams[TransactionListTypeFilter.SENT],
        },
    });
    const executions = useWorkspaceTransactionAvailability({
        queryParams: {
            daoIds,
            ...transactionListTypeQueryParams[
                TransactionListTypeFilter.EXECUTIONS
            ],
        },
    });

    const filterAvailability = {
        [TransactionListTypeFilter.RECEIVED]: {
            itemsCount: received.data,
            isError: received.isError,
            isPending: received.isPending,
        },
        [TransactionListTypeFilter.SENT]: {
            itemsCount: sent.data,
            isError: sent.isError,
            isPending: sent.isPending,
        },
        [TransactionListTypeFilter.EXECUTIONS]: {
            itemsCount: executions.data,
            isError: executions.isError,
            isPending: executions.isPending,
        },
    };

    const isFilterAvailabilityLoading = [received, sent, executions].some(
        (query) => query.isPending,
    );

    const visibleTypeFilters = dataListUtils.getVisibleFilters(
        transactionListTypeFilters,
        filterAvailability,
        [TransactionListTypeFilter.ALL],
    );
    const showTypeFilters =
        !isFilterAvailabilityLoading &&
        visibleTypeFilters.filter(
            (filter) => filter !== TransactionListTypeFilter.ALL,
        ).length > 1;

    const [activeTypeFilter, setActiveTypeFilter] = useFilterUrlParam({
        fallbackValue: TransactionListTypeFilter.ALL,
        name: transactionListTypeFilterParam,
        validValues: visibleTypeFilters,
    });

    const {
        onLoadMore,
        transactions,
        state,
        itemsCount,
        emptyState,
        errorState,
    } = useWorkspaceTransactionListData({
        queryParams: {
            daoIds,
            pageSize,
            ...transactionListTypeQueryParams[
                activeTypeFilter as TransactionListTypeFilter
            ],
        },
    });

    return (
        <DataListRoot
            entityLabel={t('app.finance.transactionList.entity')}
            itemsCount={itemsCount}
            onLoadMore={onLoadMore}
            pageSize={pageSize}
            state={state}
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
                                `app.finance.transactionList.typeFilter.${filter}`,
                            )}
                            value={filter}
                        />
                    ))}
                </ToggleGroup>
            )}
            <DataListContainer
                emptyState={emptyState}
                errorState={errorState}
                SkeletonElement={TransactionDataListItem.Skeleton}
            >
                {transactions.map((item, index) => (
                    <TransactionListItem
                        dao={daoById.get(item.daoId)}
                        index={index}
                        key={item.key}
                        onTransactionClick={(transaction) =>
                            onTransactionClick?.(
                                transaction,
                                daoById.get(item.daoId),
                            )
                        }
                        transaction={item.transaction}
                    />
                ))}
            </DataListContainer>
            <DataListPagination />
        </DataListRoot>
    );
};
