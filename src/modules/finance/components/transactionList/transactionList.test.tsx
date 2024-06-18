import { wagmiConfig } from '@/modules/application/constants/wagmi';
import { useTransactionList } from '@/modules/finance/api/financeService/queries/useTransactionList';
import { OdsModulesProvider } from '@aragon/ods';
import { render, screen } from '@testing-library/react';
import { TransactionList, type ITransactionListProps } from './transactionList';

jest.mock('@/modules/finance/api/financeService/queries/useTransactionList', () => ({
    useTransactionList: jest.fn(),
}));

describe('<TransactionList /> component', () => {
    const createTestComponent = (props?: Partial<ITransactionListProps>) => {
        const minimumProps: ITransactionListProps = { ...props };
        return (
            <OdsModulesProvider wagmiConfig={wagmiConfig}>
                <TransactionList {...minimumProps} />
            </OdsModulesProvider>
        );
    };

    beforeEach(() => {
        (useTransactionList as jest.Mock).mockReturnValue({
            data: {
                pages: [
                    {
                        data: [
                            {
                                chainId: 1,
                                hash: '0x123',
                                date: '2023-01-01T00:00:00Z',
                                type: 'deposit',
                                status: 'success',
                                tokenSymbol: 'ETH',
                                tokenAmount: 1,
                                tokenPrice: 2000,
                                tokenAddress: '0xTokenAddress',
                            },
                        ],
                        metadata: {
                            limit: 10,
                            totRecords: 1,
                            currentPage: 1,
                            totPages: 1,
                            skip: 0,
                        },
                    },
                ],
            },
            fetchNextPage: jest.fn(),
            isLoading: false,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should render without crashing', () => {
        render(createTestComponent());
        expect(screen.getByRole('link')).toBeInTheDocument();
    });
});
