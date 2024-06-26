import { generateTransaction } from '@/modules/finance/testUtils';
import { OdsModulesProvider } from '@aragon/ods';
import { render, screen } from '@testing-library/react';
import * as useTransactionListData from '../../hooks/useTransactionListData';
import { TransactionList, type ITransactionListProps } from './transactionList';

describe('<TransactionList /> component', () => {
    const useTransactionListDataSpy = jest.spyOn(useTransactionListData, 'useTransactionListData');

    beforeEach(() => {
        useTransactionListDataSpy.mockImplementation(jest.fn());
    });

    afterEach(() => {
        useTransactionListDataSpy.mockReset();
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

        const mockResult = {
            onLoadMore: jest.fn(),
            transactionList: transactions,
            state: 'idle' as const,
            pageSize: 10,
            itemsCount: 2,
            emptyState: { heading: 'Empty state', description: 'No transactions found' },
            errorState: { heading: 'Error state', description: 'An error occurred' },
        };

        useTransactionListDataSpy.mockReturnValue(mockResult);
        render(createTestComponent());

        transactions.forEach((transaction) => {
            expect(screen.getByText(`${transaction.value} ${transaction.token.symbol}`)).toBeInTheDocument();
        });
    });
});
