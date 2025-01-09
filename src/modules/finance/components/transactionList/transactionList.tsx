'use client';

import { useTransactionListData } from '@/modules/finance/hooks/useTransactionListData';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import {
    DataListContainer,
    DataListPagination,
    DataListRoot,
    TransactionType as DataListTransactionType,
    TransactionDataListItem,
    TransactionStatus,
} from '@aragon/gov-ui-kit';
import type { IGetTransactionListParams, TransactionType } from '../../api/financeService';

export interface ITransactionListProps {
    /**
     * Initial parameters to use to fetch the DAO transaction list.
     */
    initialParams: IGetTransactionListParams;
}

const transactionTypeToDataListType: Record<TransactionType, DataListTransactionType> = {
    withdraw: DataListTransactionType.WITHDRAW,
    deposit: DataListTransactionType.DEPOSIT,
};

export const TransactionList: React.FC<ITransactionListProps> = (props) => {
    const { initialParams, ...otherProps } = props;
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
            {...otherProps}
        >
            <DataListContainer
                emptyState={emptyState}
                errorState={errorState}
                SkeletonElement={TransactionDataListItem.Skeleton}
            >
                {transactionList?.map((transaction, index) => (
                    <TransactionDataListItem.Structure
                        // Multiple transactions can have the same transaction hash
                        // (e.g. one deposit and one withdraw on the same proposal)
                        key={`${transaction.transactionHash}-${index.toString()}`}
                        chainId={networkDefinitions[transaction.network].chainId}
                        hash={transaction.transactionHash}
                        target="_blank"
                        date={transaction.blockTimestamp * 1000}
                        type={transactionTypeToDataListType[transaction.type]}
                        status={TransactionStatus.SUCCESS}
                        tokenSymbol={transaction.token.symbol}
                        tokenAmount={transaction.value}
                        amountUsd={transaction.amountUsd}
                    />
                ))}
            </DataListContainer>
            <DataListPagination />
        </DataListRoot>
    );
};
