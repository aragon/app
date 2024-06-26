import * as financeService from '@/modules/finance/api/financeService/queries/useTransactionList';
import { generateTransaction } from '@/modules/finance/testUtils';
import {
    generatePaginatedResponse,
    generatePaginatedResponseMetadata,
    generateReactQueryInfiniteResultError,
    generateReactQueryInfiniteResultSuccess,
} from '@/shared/testUtils';
import { OdsModulesProvider } from '@aragon/ods';
import { type InfiniteData } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { TransactionList, type ITransactionListProps } from './transactionList';

jest.mock('@/modules/finance/api/financeService/queries/useTransactionList', () => ({
    __esModule: true,
    ...jest.requireActual('@/modules/finance/api/financeService/queries/useTransactionList'),
}));

describe('<TransactionList /> component and useTransactionListData hook', () => {
    const useTransactionListSpy = jest.spyOn(financeService, 'useTransactionList');

    afterEach(() => {
        useTransactionListSpy.mockReset();
        jest.clearAllMocks();
    });

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
                    type: 'ERC-20',
                    decimals: 18,
                    priceChangeOnDayUsd: '0.5',
                    priceUsd: '1.23',
                },
                value: '100',
                transactionHash: '0x0000000000000000000000000000000000000001',
            }),
        ];
        const transactionsMetadata = generatePaginatedResponseMetadata({
            pageSize: 10,
            totalRecords: transactions.length,
        });
        const transactionsResponse = generatePaginatedResponse({
            data: transactions,
            metadata: transactionsMetadata,
        });
        const mockResult: InfiniteData<typeof transactionsResponse> = {
            pages: [transactionsResponse],
            pageParams: [],
        };
        useTransactionListSpy.mockReturnValue(generateReactQueryInfiniteResultSuccess({ data: mockResult }));
        render(createTestComponent());

        transactions.forEach((transaction) => {
            expect(screen.getByText(`${transaction.value} ${transaction.token.symbol}`)).toBeInTheDocument();
        });
    });

    it('renders an empty state when no transactions are found', () => {
        const transactionsResponse = generatePaginatedResponse({
            data: [],
            metadata: generatePaginatedResponseMetadata({
                pageSize: 10,
                totalRecords: 0,
            }),
        });
        const mockResult: InfiniteData<typeof transactionsResponse> = {
            pages: [transactionsResponse],
            pageParams: [],
        };
        useTransactionListSpy.mockReturnValue(
            generateReactQueryInfiniteResultSuccess({ data: mockResult, isFetchedAfterMount: true }),
        );
        render(createTestComponent());

        // Select the empty state using class selectors
        const emptyStateContainer = screen.getByText(/app.finance.transactionList.emptyState.heading/i).closest('div');
        expect(emptyStateContainer).toBeInTheDocument();
    });

    it('renders an error state when fetching transactions fails', () => {
        useTransactionListSpy.mockReturnValue(generateReactQueryInfiniteResultError({ error: new Error('error') }));
        render(createTestComponent());

        // Select the error state using class selectors
        const errorStateContainer = screen.getByText(/app.finance.transactionList.errorState.heading/i).closest('div');
        expect(errorStateContainer).toBeInTheDocument();
    });
});
