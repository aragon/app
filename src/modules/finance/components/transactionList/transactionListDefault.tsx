'use client';

import type { IGetTransactionListParams, ITransaction } from '@/modules/finance/api/financeService';
import { useTransactionListData } from '@/modules/finance/hooks/useTransactionListData';
import type { IDaoPlugin, IPluginSettings } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { DataListContainer, DataListPagination, DataListRoot, TransactionDataListItem } from '@aragon/gov-ui-kit';
import type { ReactNode } from 'react';
import { TransactionListItem } from './transactionListItem';

export interface ITransactionListDefaultProps<TSettings extends IPluginSettings = IPluginSettings> {
    /**
     * Initial parameters to use for fetching the transaction list.
     */
    initialParams: IGetTransactionListParams;
    /**
     * DAO plugin (SubDAO) to display transactions for.
     */
    plugin?: IDaoPlugin<TSettings>;
    /**
     * Callback called on transaction click.
     */
    onTransactionClick?: (transaction: ITransaction) => void;
    /**
     * Hides the pagination when set to true.
     */
    hidePagination?: boolean;
    /**
     * Children of the component.
     */
    children?: ReactNode;
}

export const TransactionListDefault: React.FC<ITransactionListDefaultProps> = (props) => {
    const { initialParams, hidePagination, children, onTransactionClick } = props;

    const { t } = useTranslations();

    const { onLoadMore, state, pageSize, itemsCount, errorState, emptyState, transactionList } =
        useTransactionListData(initialParams);

    return (
        <DataListRoot
            entityLabel={t('app.finance.transactionList.entity')}
            onLoadMore={onLoadMore}
            state={state}
            pageSize={pageSize}
            itemsCount={itemsCount}
        >
            <DataListContainer
                SkeletonElement={TransactionDataListItem.Skeleton}
                errorState={errorState}
                emptyState={emptyState}
            >
                {transactionList?.map((transaction, index) => (
                    <TransactionListItem
                        key={`${transaction.transactionHash}-${index.toString()}`}
                        index={index}
                        transaction={transaction}
                        onTransactionClick={onTransactionClick}
                    />
                ))}
            </DataListContainer>
            {!hidePagination && <DataListPagination />}
            {children}
        </DataListRoot>
    );
};
