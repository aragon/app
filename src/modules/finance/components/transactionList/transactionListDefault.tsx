'use client';

import {
    DataListContainer,
    DataListPagination,
    DataListRoot,
    Dropdown,
    Toggle,
    ToggleGroup,
    TransactionDataListItem,
} from '@aragon/gov-ui-kit';
import type { ReactNode } from 'react';
import type {
    IGetTransactionListParams,
    IGetTransactionListQueryParams,
    ITransactionExecution,
} from '@/modules/finance/api/financeService';
import {
    TransactionSide,
    useTransactionList,
} from '@/modules/finance/api/financeService';
import { useTransactionListData } from '@/modules/finance/hooks/useTransactionListData';
import type {
    IDao,
    IDaoPlugin,
    IPluginSettings,
} from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IDaoFilterOption } from '@/shared/hooks/useDaoFilterUrlParam';
import { useFilterUrlParam } from '@/shared/hooks/useFilterUrlParam';
import { dataListUtils } from '@/shared/utils/dataListUtils';
import { TransactionListItem } from './transactionListItem';

enum TransactionListTypeFilter {
    ALL = 'all',
    EXECUTIONS = 'executions',
    RECEIVED = 'received',
    SENT = 'sent',
}

export const transactionListTypeFilterParam = 'transactiontype';

const transactionListTypeFilters = Object.values(TransactionListTypeFilter);

const typeQueryParams: Record<
    TransactionListTypeFilter,
    Pick<IGetTransactionListQueryParams, 'side' | 'type'>
> = {
    [TransactionListTypeFilter.ALL]: {},
    [TransactionListTypeFilter.RECEIVED]: {
        side: TransactionSide.DEPOSIT,
    },
    [TransactionListTypeFilter.SENT]: {
        side: TransactionSide.WITHDRAW,
    },
    [TransactionListTypeFilter.EXECUTIONS]: {
        type: 'execution' as const,
    },
};

export interface ITransactionListDefaultProps<
    TSettings extends IPluginSettings = IPluginSettings,
> {
    /**
     * Initial parameters to use for fetching the transaction list.
     */
    initialParams: IGetTransactionListParams;
    /**
     * DAO plugin (linked account) to display transactions for.
     */
    plugin?: IDaoPlugin<TSettings>;
    /**
     * DAO the transactions belong to.
     */
    dao?: IDao;
    /**
     * Callback called on transaction click.
     */
    onTransactionClick?: (transaction: ITransactionExecution) => void;
    /**
     * Hides the pagination when set to true.
     */
    hidePagination?: boolean;
    /**
     * Children of the component.
     */
    children?: ReactNode;
    /**
     * Linked-account (SubDAO) filter state. When present with 2+ non-"All"
     * options, renders a dropdown beside the type filters.
     */
    bodyFilter?: {
        options: IDaoFilterOption[];
        value: IDaoFilterOption;
        onSelect: (option: IDaoFilterOption) => void;
    };
}

export const TransactionListDefault: React.FC<ITransactionListDefaultProps> = (
    props,
) => {
    const {
        initialParams,
        hidePagination,
        children,
        onTransactionClick,
        dao,
        bodyFilter,
    } = props;

    const { t } = useTranslations();

    const availabilityParams = (
        filter: Exclude<
            TransactionListTypeFilter,
            TransactionListTypeFilter.ALL
        >,
    ): IGetTransactionListParams => ({
        ...initialParams,
        queryParams: {
            ...initialParams.queryParams,
            ...typeQueryParams[filter],
            pageSize: 1,
        },
    });

    const receivedTransactions = useTransactionList(
        availabilityParams(TransactionListTypeFilter.RECEIVED),
    );
    const sentTransactions = useTransactionList(
        availabilityParams(TransactionListTypeFilter.SENT),
    );
    const executionTransactions = useTransactionList(
        availabilityParams(TransactionListTypeFilter.EXECUTIONS),
    );

    const filterAvailability = {
        [TransactionListTypeFilter.RECEIVED]: {
            itemsCount:
                receivedTransactions.data?.pages[0].metadata.totalRecords,
            isError: receivedTransactions.isError,
            isPending: receivedTransactions.isPending,
        },
        [TransactionListTypeFilter.SENT]: {
            itemsCount: sentTransactions.data?.pages[0].metadata.totalRecords,
            isError: sentTransactions.isError,
            isPending: sentTransactions.isPending,
        },
        [TransactionListTypeFilter.EXECUTIONS]: {
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
        transactionListTypeFilters,
        filterAvailability,
        [TransactionListTypeFilter.ALL],
    );
    const availableTransactionTypes = visibleTypeFilters.filter(
        (filter) => filter !== TransactionListTypeFilter.ALL,
    );
    const showTypeFilters =
        !isFilterAvailabilityLoading && availableTransactionTypes.length > 1;

    const [activeTypeFilter, setActiveTypeFilter] = useFilterUrlParam({
        fallbackValue: TransactionListTypeFilter.ALL,
        name: transactionListTypeFilterParam,
        validValues: visibleTypeFilters,
    });

    const allAccountsLabel = t('app.finance.transactionList.accountFilter.all');
    const nonAllAccountOptions =
        bodyFilter?.options.filter((option) => !option.isAll) ?? [];
    const showAccountFilter =
        bodyFilter != null && nonAllAccountOptions.length >= 2;
    const activeAccountLabel = bodyFilter?.value.isAll
        ? allAccountsLabel
        : (bodyFilter?.value.label ?? allAccountsLabel);

    const filteredParams: IGetTransactionListParams = {
        ...initialParams,
        queryParams: {
            ...initialParams.queryParams,
            ...typeQueryParams[activeTypeFilter as TransactionListTypeFilter],
        },
    };

    const {
        onLoadMore,
        state,
        pageSize,
        itemsCount,
        errorState,
        emptyState,
        transactionList,
    } = useTransactionListData(filteredParams);

    return (
        <DataListRoot
            entityLabel={t('app.finance.transactionList.entity')}
            itemsCount={itemsCount}
            onLoadMore={onLoadMore}
            pageSize={pageSize}
            state={state}
        >
            {(showAccountFilter || showTypeFilters) && (
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                    {showAccountFilter && bodyFilter && (
                        <Dropdown.Container label={activeAccountLabel}>
                            {bodyFilter.options.map((option) => (
                                <Dropdown.Item
                                    key={option.id}
                                    onSelect={() => bodyFilter.onSelect(option)}
                                    selected={option.id === bodyFilter.value.id}
                                >
                                    {option.isAll
                                        ? allAccountsLabel
                                        : option.label}
                                </Dropdown.Item>
                            ))}
                        </Dropdown.Container>
                    )}
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
                </div>
            )}
            <DataListContainer
                emptyState={emptyState}
                errorState={errorState}
                SkeletonElement={TransactionDataListItem.Skeleton}
            >
                {transactionList?.map((transaction, index) => (
                    <TransactionListItem
                        dao={dao}
                        index={index}
                        key={`${transaction.transactionHash}-${index.toString()}`}
                        onTransactionClick={onTransactionClick}
                        transaction={transaction}
                    />
                ))}
            </DataListContainer>
            {!hidePagination && <DataListPagination />}
            {children}
        </DataListRoot>
    );
};
