import { useTransactionList } from '@/modules/finance/api/financeService/queries/useTransactionList';
import { useTranslations } from '@/shared/components/translationsProvider';
import {
    DataListContainer,
    DataListPagination,
    DataListRoot,
    EmptyState,
    TransactionDataListItemStructure,
} from '@aragon/ods';
import { type ComponentProps } from 'react';

export interface ITransactionListProps extends ComponentProps<'div'> {
    /**
     * If true, the pagination will be hidden.
     */
    hidePagination?: boolean;
}

export const TransactionList: React.FC<ITransactionListProps> = (props) => {
    const { hidePagination, children, ...otherProps } = props;
    const { t } = useTranslations();

    const { data: transactionListData, fetchNextPage, isLoading } = useTransactionList({ queryParams: {} });

    const transactionList = transactionListData?.pages.flatMap((page) => page.data) || [];

    return (
        <DataListRoot
            entityLabel={t('app.finance.transactionList.entity')}
            onLoadMore={fetchNextPage}
            state={isLoading ? 'fetchingNextPage' : 'idle'}
            pageSize={transactionListData?.pages[0]?.metadata.pageSize}
            itemsCount={transactionListData?.pages[0]?.metadata.totalRecords}
            {...otherProps}
        >
            <DataListContainer>
                {transactionList.length > 0 ? (
                    transactionList.map((transaction) => (
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
                    ))
                ) : (
                    <EmptyState
                        heading="No transactions found"
                        description="This will show the DAO's onchain actions when available."
                        humanIllustration={{ body: 'BLOCKS', hairs: 'MIDDLE', expression: 'SURPRISED' }}
                    />
                )}
            </DataListContainer>
            {transactionList.length > 0 && !hidePagination && <DataListPagination />}
            {children}
        </DataListRoot>
    );
};
