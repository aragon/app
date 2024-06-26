import { generateAsset, generateTransaction } from '@/modules/finance/testUtils';
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
            initialParams: { queryParams: {} },
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
            generateTransaction({ token: generateAsset({ symbol: 'ABC' }), value: '100', transactionHash: '0x1' }),
            generateTransaction({ token: generateAsset({ symbol: 'DEF' }), value: '200', transactionHash: '0x2' }),
        ];
        useTransactionListDataSpy.mockReturnValue({
            onLoadMore: jest.fn(),
            transactionList: transactions,
            state: 'idle' as const,
            pageSize: 10,
            itemsCount: 2,
            emptyState: { heading: '', description: '' },
            errorState: { heading: '', description: '' },
        });

        render(createTestComponent());

        transactions.forEach((transaction) => {
            expect(screen.getByText(`${transaction.value} ${transaction.token.symbol}`)).toBeInTheDocument();
        });
    });
});
