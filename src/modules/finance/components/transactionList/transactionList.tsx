'use client';

import { type TransactionType } from '@/modules/finance/api/financeService/domain/enum';
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
} from '@aragon/ods';
import type { IGetTransactionListParams } from '../../api/financeService';

export interface ITransactionListProps {
    /**
     * Initial parameters to use to fetch the DAO transaction list.
     */
    initialParams: IGetTransactionListParams;
}

export const transactionTypeToDataListType: Record<TransactionType, DataListTransactionType> = {
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
                {transactionList?.map((transaction) => {
                    /* TODO: We need correct token price at time of transaction to avoid below calculation (APP-3526) */
                    const tokenPriceRaw = Number(transaction.amountUsd) / Number(transaction.value);
                    const tokenPrice = isNaN(tokenPriceRaw) ? 0 : tokenPriceRaw;
                    return (
                        <TransactionDataListItem.Structure
                            chainId={networkDefinitions[transaction.network].chainId}
                            hash={transaction.transactionHash}
                            key={transaction.transactionHash}
                            date={transaction.blockTimestamp * 1000}
                            type={transactionTypeToDataListType[transaction.type]}
                            status={TransactionStatus.SUCCESS}
                            tokenSymbol={transaction.token.symbol}
                            tokenAmount={transaction.value}
                            tokenPrice={tokenPrice}
                        />
                    );
                })}
            </DataListContainer>
            <DataListPagination />
        </DataListRoot>
    );
};
