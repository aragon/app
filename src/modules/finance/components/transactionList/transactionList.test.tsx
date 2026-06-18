import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as financeService from '@/modules/finance/api/financeService';
import { TransactionSide } from '@/modules/finance/api/financeService';
import {
    generateToken,
    generateTransaction,
} from '@/modules/finance/testUtils';
import { PluginInterfaceType } from '@/shared/api/daoService';
import {
    generateDao,
    generateDaoPlugin,
    generatePaginatedResponse,
    generateReactQueryInfiniteResultSuccess,
} from '@/shared/testUtils';
import * as useTransactionListData from '../../hooks/useTransactionListData';
import { type ITransactionListDefaultProps, TransactionList } from '.';

describe('<TransactionList.Default /> component', () => {
    const useTransactionListDataSpy = jest.spyOn(
        useTransactionListData,
        'useTransactionListData',
    );
    const useTransactionListSpy = jest.spyOn(
        financeService,
        'useTransactionList',
    );
    let transactionTypeAvailability = {
        received: 1,
        sent: 1,
        executions: 1,
    };

    const mockAvailabilityQuery = (
        itemsCount: number,
    ): ReturnType<typeof financeService.useTransactionList> =>
        generateReactQueryInfiniteResultSuccess({
            data: {
                pages: [
                    generatePaginatedResponse({
                        metadata: {
                            page: 1,
                            pageSize: 1,
                            totalPages: itemsCount > 0 ? 1 : 0,
                            totalRecords: itemsCount,
                        },
                    }),
                ],
                pageParams: [],
            },
        });

    const mockTransactionTypeAvailability = (
        received = 1,
        sent = 1,
        executions = 1,
    ) => {
        transactionTypeAvailability = { received, sent, executions };
    };

    beforeEach(() => {
        useTransactionListDataSpy.mockImplementation(jest.fn());
        mockTransactionTypeAvailability();
        useTransactionListSpy.mockImplementation((params) => {
            const { side, type } = params.queryParams;
            const itemsCount =
                type === 'execution'
                    ? transactionTypeAvailability.executions
                    : side === TransactionSide.DEPOSIT
                      ? transactionTypeAvailability.received
                      : transactionTypeAvailability.sent;

            return mockAvailabilityQuery(itemsCount);
        });
    });

    afterEach(() => {
        useTransactionListDataSpy.mockReset();
        useTransactionListSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<ITransactionListDefaultProps>,
    ) => {
        const completeProps: ITransactionListDefaultProps = {
            initialParams: { queryParams: {} },
            ...props,
        };

        return (
            <GukModulesProvider>
                <TransactionList.Default {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders the transaction list with multiple items when data is available', () => {
        const transactions = [
            generateTransaction({
                token: generateToken({ symbol: 'ABC' }),
                value: '100',
                transactionHash: '0x1',
            }),
            generateTransaction({
                token: generateToken({ symbol: 'DEF' }),
                value: '200',
                transactionHash: '0x2',
            }),
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
            expect(
                screen.getByText(
                    `${transaction.value} ${transaction.token.symbol}`,
                ),
            ).toBeInTheDocument();
        });
    });

    it('does not render type filters when only one transaction type is available', () => {
        mockTransactionTypeAvailability(0, 0, 2);
        useTransactionListDataSpy.mockReturnValue({
            onLoadMore: jest.fn(),
            transactionList: [],
            state: 'idle' as const,
            pageSize: 10,
            itemsCount: 2,
            emptyState: { heading: '', description: '' },
            errorState: { heading: '', description: '' },
        });

        render(createTestComponent());

        expect(
            screen.queryByRole('radio', { name: 'Executions' }),
        ).not.toBeInTheDocument();
    });

    it('filters the transaction query by the selected type', async () => {
        const user = userEvent.setup();
        useTransactionListDataSpy.mockReturnValue({
            onLoadMore: jest.fn(),
            transactionList: [],
            state: 'idle' as const,
            pageSize: 10,
            itemsCount: 0,
            emptyState: { heading: '', description: '' },
            errorState: { heading: '', description: '' },
        });

        render(createTestComponent());
        await user.click(
            screen.getByRole('radio', {
                name: 'app.finance.transactionList.typeFilter.received',
            }),
        );

        expect(useTransactionListDataSpy).toHaveBeenLastCalledWith({
            queryParams: { side: TransactionSide.DEPOSIT },
        });
    });

    it('does not render the token price in usd', () => {
        const transaction = generateTransaction({
            token: generateToken({ symbol: 'AAA' }),
            value: '150',
            amountUsd: '1462.5',
        });

        useTransactionListDataSpy.mockReturnValue({
            onLoadMore: jest.fn(),
            transactionList: [transaction],
            state: 'idle' as const,
            pageSize: 10,
            itemsCount: 1,
            emptyState: { heading: '', description: '' },
            errorState: { heading: '', description: '' },
        });

        render(createTestComponent());

        expect(screen.queryByText('$1.46K')).not.toBeInTheDocument();
    });

    it('renders execution transactions with source and action count', () => {
        const transaction = generateTransaction({
            side: TransactionSide.EXECUTION,
            source: 'router',
            actionCount: 3,
        });

        useTransactionListDataSpy.mockReturnValue({
            onLoadMore: jest.fn(),
            transactionList: [transaction],
            state: 'idle' as const,
            pageSize: 10,
            itemsCount: 1,
            emptyState: { heading: '', description: '' },
            errorState: { heading: '', description: '' },
        });

        render(createTestComponent());

        expect(screen.getByText('Executed')).toBeInTheDocument();
        expect(screen.getByText('router')).toBeInTheDocument();
        expect(screen.getByText('3 actions')).toBeInTheDocument();
    });

    it('renders execution source using the DAO plugin name', () => {
        const transaction = generateTransaction({
            side: TransactionSide.EXECUTION,
            source: 'tokenvoting',
        });
        const dao = generateDao({
            plugins: [
                generateDaoPlugin({
                    interfaceType: PluginInterfaceType.TOKEN_VOTING,
                    processKey: 'tokenvoting',
                    subdomain: 'token-voting',
                }),
            ],
        });

        useTransactionListDataSpy.mockReturnValue({
            onLoadMore: jest.fn(),
            transactionList: [transaction],
            state: 'idle' as const,
            pageSize: 10,
            itemsCount: 1,
            emptyState: { heading: '', description: '' },
            errorState: { heading: '', description: '' },
        });

        render(createTestComponent({ dao }));

        expect(screen.getByText('Token Voting')).toBeInTheDocument();
        expect(screen.queryByText('tokenvoting')).not.toBeInTheDocument();
    });

    it('calls the transaction click handler only for execution rows', async () => {
        const user = userEvent.setup();
        const transferTransaction = generateTransaction({
            transactionHash: '0x1',
            token: generateToken({ symbol: 'ABC' }),
        });
        const executionTransaction = generateTransaction({
            side: TransactionSide.EXECUTION,
            transactionHash: '0x2',
        });
        const onTransactionClick = jest.fn();

        useTransactionListDataSpy.mockReturnValue({
            onLoadMore: jest.fn(),
            transactionList: [transferTransaction, executionTransaction],
            state: 'idle' as const,
            pageSize: 10,
            itemsCount: 2,
            emptyState: { heading: '', description: '' },
            errorState: { heading: '', description: '' },
        });

        render(createTestComponent({ onTransactionClick }));

        await user.click(screen.getByText('0 ABC'));
        expect(onTransactionClick).not.toHaveBeenCalled();

        await user.click(screen.getByText('Executed'));
        expect(onTransactionClick).toHaveBeenCalledWith(executionTransaction);
    });
});
