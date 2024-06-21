'use client';

import { transactionTypeToDataListType } from '@/modules/finance/api/financeService/domain/transaction';
import { useTransactionList } from '@/modules/finance/api/financeService/queries/useTransactionList';
import { useTranslations } from '@/shared/components/translationsProvider';
import {
    CardEmptyState,
    DataListContainer,
    DataListPagination,
    DataListRoot,
    TransactionDataListItemSkeleton,
    TransactionDataListItemStructure,
    TransactionStatus,
} from '@aragon/ods';
import { type ComponentProps } from 'react';

export interface ITransactionListProps extends ComponentProps<'div'> {
    /**
     * If true, the pagination will be hidden.
     */
    hidePagination?: boolean;
    /**
     * ID of the DAO
     */
    address?: string;
    /**
     * Network of the DAO
     */
    network?: string;
}

export const TransactionList: React.FC<ITransactionListProps> = (props) => {
    const { hidePagination, children, address, network, ...otherProps } = props;
    const { t } = useTranslations();

    const {
        data: transactionListData,
        fetchNextPage,
        isLoading,
        isFetchingNextPage,
        isFetchedAfterMount,
    } = useTransactionList({ queryParams: { address, network } });

    const transactionList = transactionListData?.pages.flatMap((page) => page.data);

    console.log('single data', transactionList);

    return (
        <DataListRoot
            entityLabel={t('app.finance.transactionList.entity')}
            onLoadMore={fetchNextPage}
            state={isLoading ? 'loading' : isFetchingNextPage ? 'fetchingNextPage' : 'idle'}
            pageSize={transactionListData?.pages[0]?.metadata.pageSize}
            itemsCount={transactionListData?.pages[0]?.metadata.totalRecords}
            {...otherProps}
        >
            <DataListContainer SkeletonElement={() => <TransactionDataListItemSkeleton />}>
                {transactionList &&
                    transactionList.length > 0 &&
                    !isLoading &&
                    transactionList.map((transaction) => (
                        <TransactionDataListItemStructure
                            chainId={1}
                            hash={transaction.transactionHash}
                            key={transaction.transactionHash}
                            // TODO: needs to updated when block timestamp & formatter is available
                            date={new Date(transaction.blockTimestamp! * 1000).toLocaleString()}
                            type={transactionTypeToDataListType[transaction.type]}
                            status={TransactionStatus.SUCCESS}
                            tokenSymbol={transaction.token?.symbol ?? ''}
                            tokenAmount={transaction.value}
                            tokenPrice={0}
                            tokenAddress={transaction.tokenAddress}
                        />
                    ))}
                {transactionList && transactionList.length === 0 && isFetchedAfterMount && (
                    <CardEmptyState
                        heading={t('app.finance.transactionList.emptyState.heading')}
                        description={t('app.finance.transactionList.emptyState.description')}
                        humanIllustration={{ body: 'BLOCKS', hairs: 'MIDDLE', expression: 'SURPRISED' }}
                    />
                )}
            </DataListContainer>
            {transactionList && transactionList.length > 0 && !hidePagination && <DataListPagination />}
            {children}
        </DataListRoot>
    );
};
