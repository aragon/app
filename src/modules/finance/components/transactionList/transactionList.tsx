'use client';

import { type TransactionType } from '@/modules/finance/api/financeService/domain/enum';
import { useTransactionListData } from '@/modules/finance/hooks/useTransactionListData/useTransactionListData';
import { networkDefinitions } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import {
    DataListContainer,
    DataListPagination,
    DataListRoot,
    TransactionType as DataListTransactionType,
    TransactionDataListItem,
    TransactionStatus,
} from '@aragon/ods';
import { type ComponentProps } from 'react';

export interface ITransactionListProps extends ComponentProps<'div'> {
    /**
     * ID of the DAO
     */
    address?: string;
    /**
     * Network of the DAO
     */
    network?: string;
}

export const transactionTypeToDataListType: Record<TransactionType, DataListTransactionType> = {
    withdraw: DataListTransactionType.WITHDRAW,
    deposit: DataListTransactionType.DEPOSIT,
};

export const TransactionList: React.FC<ITransactionListProps> = (props) => {
    const { children, address, network, ...otherProps } = props;
    const { t } = useTranslations();

    const queryParams = { address, network };

    const { onLoadMore, state, pageSize, itemsCount, errorState, emptyState, transactionList } = useTransactionListData(
        { queryParams },
    );

    return (
        <DataListRoot
            entityLabel={t('app.finance.transactionList.entity')}
            onLoadMore={onLoadMore}
            state={state}
            pageSize={pageSize}
            itemsCount={itemsCount}
            {...otherProps}
        >
            <DataListContainer
                emptyState={emptyState}
                errorState={errorState}
                SkeletonElement={() => <TransactionDataListItem.Skeleton />}
            >
                {transactionList?.map((transaction) => (
                    <TransactionDataListItem.Structure
                        chainId={networkDefinitions[transaction.network]?.chainId}
                        hash={transaction.transactionHash}
                        key={transaction.transactionHash}
                        // TODO: needs to updated when formatter is available [APP-3330]
                        date={new Date(transaction.blockTimestamp! * 1000).toLocaleString()}
                        type={transactionTypeToDataListType[transaction.type]}
                        status={TransactionStatus.SUCCESS}
                        tokenSymbol={transaction.token?.symbol}
                        tokenAmount={transaction.value}
                        // TODO: needs to updated when backend pricing is available [APP-3331]
                        tokenPrice={0}
                    />
                ))}
            </DataListContainer>
            <DataListPagination />
        </DataListRoot>
    );
};
