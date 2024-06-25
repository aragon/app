import { useTransactionList } from '@/modules/finance/api/financeService/queries/useTransactionList';
import { generateTransaction } from '@/modules/finance/testUtils';
import { generateReactQueryResultSuccess } from '@/shared/testUtils';
import {
    OdsModulesProvider,
    type IDataListContainerProps,
    type IDataListPaginationProps,
    type IEmptyStateProps,
    type ITransactionDataListItemProps,
} from '@aragon/ods';
import { render, screen } from '@testing-library/react';
import { TransactionList, type ITransactionListProps } from './transactionList';

jest.mock('@/modules/finance/api/financeService/queries/useTransactionList');
jest.mock('@aragon/ods', () => ({
    ...jest.requireActual('@aragon/ods'),
    TransactionDataListItemSkeleton: () => <div data-testid="transaction-data-list-item-skeleton" />,
    DataListPagination: (props: IDataListPaginationProps) => <div data-testid="data-list-pagination" {...props} />,
    DataListContainer: ({ SkeletonElement, ...props }: IDataListContainerProps) => (
        <div data-testid="data-list-container" {...props} />
    ),
    TransactionDataListItemStructure: (props: ITransactionDataListItemProps) => (
        <div data-testid="transaction-data-list-item" data-props={JSON.stringify(props)} />
    ),
    CardEmptyState: (props: IEmptyStateProps) => <div data-testid="card-empty-state" {...props} />,
}));

describe('<TransactionList /> component', () => {
    const useTransactionListMock = useTransactionList as jest.Mock;

    const createTestComponent = (props?: Partial<ITransactionListProps>) => {
        const completeProps: ITransactionListProps = {
            ...props,
        };

        return (
            <OdsModulesProvider>
                <TransactionList {...completeProps} />
            </OdsModulesProvider>
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the transaction list with multiple items when data is available', () => {
        const transactions = [
            generateTransaction(),
            generateTransaction({
                token: {
                    name: 'DAI Coin',
                    symbol: 'DAI',
                    address: '0xDaiCoinAddress',
                    network: 'ethereum-mainnet',
                    logo: 'https://example.com/dai.png',
                },
                value: '100',
                transactionHash: '0x0000000000000000000000000000000000000001',
            }),
        ];
        useTransactionListMock.mockReturnValue(
            generateReactQueryResultSuccess({
                data: {
                    pages: [{ data: transactions, metadata: { pageSize: 10, totalRecords: 2 } }],
                },
            }),
        );
        render(createTestComponent());
        const transactionElements = screen.getAllByTestId('transaction-data-list-item');
        expect(transactionElements).toHaveLength(transactions.length);
        transactions.forEach((transaction) => {
            const transactionElement = transactionElements.find((el) =>
                el.dataset.props?.includes(transaction.transactionHash),
            );
            expect(transactionElement).toBeInTheDocument();
            expect(transactionElement!.dataset.props).toContain(transaction.transactionHash);
        });
    });

    it('renders an empty state when no transactions are found', () => {
        useTransactionListMock.mockReturnValue(
            generateReactQueryResultSuccess({
                data: {
                    pages: [{ data: [], metadata: { pageSize: 10, totalRecords: 0 } }],
                },
                isFetchedAfterMount: true,
            }),
        );
        render(createTestComponent());
        expect(screen.getByTestId('card-empty-state')).toBeInTheDocument();
    });
});
