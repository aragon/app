import * as financeService from '@/modules/finance/api/financeService';
import { DaoInfoAside } from '@/modules/finance/components/daoInfoAside';
import { TransactionListStats } from '@/modules/finance/components/transactionListStats';
import * as daoService from '@/shared/api/daoService';
import * as useDaoPluginFilterUrlParam from '@/shared/hooks/useDaoPluginFilterUrlParam';
import {
    generateDao,
    generateDaoPlugin,
    generateFilterComponentPlugin,
    generateReactQueryResultSuccess,
    generateSubDao,
} from '@/shared/testUtils';
import { render, screen } from '@testing-library/react';
import { DaoTransactionsPageClient, type IDaoTransactionsPageClientProps } from './daoTransactionsPageClient';

jest.mock('@/modules/finance/components/transactionList', () => ({
    TransactionList: {
        Container: jest.fn(() => <div data-testid="transaction-list-container" />),
        Default: jest.fn(() => null),
    },
    transactionListFilterParam: 'subdao',
}));

jest.mock('@/modules/finance/components/transactionListStats', () => ({
    TransactionListStats: jest.fn(() => <div data-testid="transaction-list-stats" />),
}));

jest.mock('@/modules/finance/components/daoInfoAside', () => ({
    DaoInfoAside: jest.fn(() => <div data-testid="transaction-subdao-info" />),
}));

describe('<DaoTransactionsPageClient /> component', () => {
    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const useDaoPluginFilterUrlParamSpy = jest.spyOn(useDaoPluginFilterUrlParam, 'useDaoPluginFilterUrlParam');
    const useTransactionListSpy = jest.spyOn(financeService, 'useTransactionList');

    const allTransactionsPlugin = generateFilterComponentPlugin({
        id: 'all',
        uniqueId: 'all',
        label: 'All transactions',
        meta: generateDaoPlugin(),
    });

    beforeEach(() => {
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDao() }));
        useDaoPluginFilterUrlParamSpy.mockReturnValue({
            activePlugin: allTransactionsPlugin,
            setActivePlugin: jest.fn(),
            plugins: [allTransactionsPlugin],
        });
        useTransactionListSpy.mockReturnValue({
            data: {
                pages: [
                    {
                        metadata: { totalRecords: 42 },
                        data: [{ blockTimestamp: 1_700_000_000 }],
                    },
                ],
            },
            status: 'success',
            fetchStatus: 'idle',
            isFetchingNextPage: false,
            fetchNextPage: jest.fn(),
        } as unknown as ReturnType<typeof financeService.useTransactionList>);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const createTestComponent = (props?: Partial<IDaoTransactionsPageClientProps>) => {
        const completeProps: IDaoTransactionsPageClientProps = {
            id: 'test-id',
            initialParams: { queryParams: {} },
            ...props,
        };

        return <DaoTransactionsPageClient {...completeProps} />;
    };

    it('fetches the DAO with the provided id prop', () => {
        const id = 'new-test-id';
        render(createTestComponent({ id }));
        expect(useDaoSpy).toHaveBeenCalledWith({ urlParams: { id } });
    });

    it('renders the page title, Transactions list tabs and stats for all transactions', () => {
        render(createTestComponent());

        expect(screen.getByText(/daoTransactionsPage.main.title/)).toBeInTheDocument();
        expect(screen.getByTestId('transaction-list-container')).toBeInTheDocument();
        expect(screen.getByTestId('transaction-list-stats')).toBeInTheDocument();
        expect(screen.queryByTestId('transaction-subdao-info')).not.toBeInTheDocument();
    });

    it('renders SubDAO info when a specific plugin is selected', () => {
        const subDao = generateSubDao({ address: '0xplug1' });
        const dao = generateDao({ subDaos: [subDao] });
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: dao }));

        const plugin = generateFilterComponentPlugin({
            id: 'plugin',
            uniqueId: 'plugin-1',
            label: 'Treasury',
            meta: generateDaoPlugin({ address: '0xplug1', description: 'SubDAO treasury' }),
        });
        useDaoPluginFilterUrlParamSpy.mockReturnValueOnce({
            activePlugin: plugin,
            setActivePlugin: jest.fn(),
            plugins: [plugin],
        });

        render(createTestComponent());

        expect(screen.getByTestId('transaction-list-container')).toBeInTheDocument();
        expect(screen.getByTestId('transaction-subdao-info')).toBeInTheDocument();
        const subDaoInfoMock = DaoInfoAside as jest.MockedFunction<typeof DaoInfoAside>;
        const subDaoInfoProps = subDaoInfoMock.mock.calls[0]?.[0];

        expect(subDaoInfoProps).toEqual(
            expect.objectContaining({
                plugin: plugin.meta,
                network: dao.network,
                daoId: 'test-id',
                subDao,
                dao,
                stats: expect.any(Array),
            }),
        );
        expect(TransactionListStats).not.toHaveBeenCalled();
    });
});
