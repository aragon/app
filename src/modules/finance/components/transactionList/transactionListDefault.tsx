'use client';

import { DataListContainer, DataListPagination, DataListRoot, TransactionDataListItem } from '@aragon/gov-ui-kit';
import type { ReactNode } from 'react';
import type { IGetTransactionListParams, ITransaction } from '@/modules/finance/api/financeService';
import { useTransactionListData } from '@/modules/finance/hooks/useTransactionListData';
import type { IDaoPlugin, IPluginSettings } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
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

    const { onLoadMore, state, pageSize, itemsCount, errorState, emptyState, transactionList } = useTransactionListData(initialParams);

    return (
        <DataListRoot
            entityLabel={t('app.finance.transactionList.entity')}
            itemsCount={itemsCount}
            onLoadMore={onLoadMore}
            pageSize={pageSize}
            state={state}
        >
            <DataListContainer emptyState={emptyState} errorState={errorState} SkeletonElement={TransactionDataListItem.Skeleton}>
                {transactionList?.map((transaction, index) => (
                    <TransactionListItem
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
