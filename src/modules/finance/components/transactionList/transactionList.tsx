'use client';

import { useTransactionList } from '@/modules/finance/api/financeService/queries/useTransactionList';
import { useTranslations } from '@/shared/components/translationsProvider';
import { DataListContainer, DataListPagination, DataListRoot, TransactionDataListItemStructure } from '@aragon/ods';

export interface ITransactionListProps {}

export const TransactionList: React.FC<ITransactionListProps> = () => {
    const { t } = useTranslations();

    const { data: transactionListData, fetchNextPage, isLoading } = useTransactionList({ queryParams: {} });

    const transactionList = transactionListData?.pages.flatMap((page) => page.data);

    return (
        <DataListRoot
            entityLabel={t('app.finance.transactionList.entity')}
            onLoadMore={fetchNextPage}
            state={isLoading ? 'fetchingNextPage' : 'idle'}
            pageSize={transactionListData?.pages[0].metadata.pageSize}
            itemsCount={transactionListData?.pages[0].metadata.totalRecords}
        >
            <DataListContainer>
                {transactionList?.map((transaction) => (
                    <TransactionDataListItemStructure
                        chainId={transaction.chainId}
                        hash={transaction.hash}
                        key={transaction.hash}
                        date={transaction.date}
                        type={transaction.type}
                        status={transaction.status}
                        tokenSymbol={transaction.tokenSymbol}
                        tokenAmount={transaction.tokenAmount}
                        tokenPrice={transaction.tokenPrice}
                        tokenAddress={transaction.tokenAddress}
                    />
                ))}
            </DataListContainer>
            <DataListPagination />
        </DataListRoot>
    );
};
