import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ITransactionExecution } from '@/modules/finance/api/financeService';
import { TransactionSide } from '@/modules/finance/api/financeService';
import {
    generateToken,
    generateTransaction,
} from '@/modules/finance/testUtils';
import { PluginInterfaceType } from '@/shared/api/daoService';
import { generateDao, generateDaoPlugin } from '@/shared/testUtils';
import * as useTransactionListData from '../../hooks/useTransactionListData';
import { type ITransactionListDefaultProps, TransactionList } from '.';

describe('<TransactionList.Default /> component', () => {
    const useTransactionListDataSpy = jest.spyOn(
        useTransactionListData,
        'useTransactionListData',
    );

    beforeEach(() => {
        useTransactionListDataSpy.mockImplementation(jest.fn());
    });

    afterEach(() => {
        useTransactionListDataSpy.mockReset();
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

    const generateExecutionTransaction = (
        transaction?: Partial<ITransactionExecution>,
    ): ITransactionExecution => ({
        network: generateTransaction().network,
        blockNumber: 0,
        blockTimestamp: 1_700_000_000,
        fromAddress: '0x0000000000000000000000000000000000000000',
        toAddress: '0x0000000000000000000000000000000000000000',
        value: '0',
        side: TransactionSide.EXECUTION,
        type: 'execution',
        transactionHash: '0x0000000000000000000000000000000000000000',
        id: 'execution-id',
        source: 'router',
        actionCount: 2,
        ...transaction,
    });

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
        const transaction = generateExecutionTransaction({
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
        const transaction = generateExecutionTransaction({
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
        const executionTransaction = generateExecutionTransaction({
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
