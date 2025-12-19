import { render, screen } from '@testing-library/react';
import * as financeService from '@/modules/finance/api/financeService';
import * as daoService from '@/shared/api/daoService';
import { FeatureFlagsProvider } from '@/shared/components/featureFlagsProvider';
import type { FeatureFlagSnapshot } from '@/shared/featureFlags';
import * as useDaoFilterUrlParam from '@/shared/hooks/useDaoFilterUrlParam';
import {
    generateDao,
    generateReactQueryResultSuccess,
    generateSubDao,
} from '@/shared/testUtils';
import {
    DaoTransactionsPageClient,
    type IDaoTransactionsPageClientProps,
} from './daoTransactionsPageClient';

jest.mock('@/modules/finance/components/transactionList', () => ({
    TransactionList: {
        Container: jest.fn(() => (
            <div data-testid="transaction-list-container" />
        )),
        Default: jest.fn(() => null),
    },
    transactionListFilterParam: 'subdao',
}));

jest.mock('@/modules/finance/components/allAssetsStats', () => ({
    AllAssetsStats: jest.fn(() => <div data-testid="all-assets-stats" />),
}));

jest.mock('@/modules/finance/components/daoInfoAside', () => ({
    DaoInfoAside: jest.fn(() => <div data-testid="transaction-subdao-info" />),
}));

jest.mock(
    '@/modules/capitalFlow/components/dispatchPanel/dispatchPanel',
    () => ({
        DispatchPanel: jest.fn(() => null),
    }),
);

describe('<DaoTransactionsPageClient /> component', () => {
    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const useDaoFilterUrlParamSpy = jest.spyOn(
        useDaoFilterUrlParam,
        'useDaoFilterUrlParam',
    );
    const useTransactionListSpy = jest.spyOn(
        financeService,
        'useTransactionList',
    );
    const useAssetListSpy = jest.spyOn(financeService, 'useAssetList');

    const featureFlagSnapshot: FeatureFlagSnapshot[] = [
        {
            key: 'debugPanel',
            name: 'Debug panel',
            description: '',
            enabled: false,
        },
        {
            key: 'subDao',
            name: 'SubDAO support',
            description: '',
            enabled: true,
        },
    ];

    beforeEach(() => {
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: generateDao() }),
        );
        useDaoFilterUrlParamSpy.mockReturnValue({
            activeOption: {
                id: 'all',
                label: 'All transactions',
                daoId: 'test-id',
                isAll: true,
                isParent: false,
            },
            setActiveOption: jest.fn(),
            options: [
                {
                    id: 'all',
                    label: 'All transactions',
                    daoId: 'test-id',
                    isAll: true,
                    isParent: false,
                },
                {
                    id: 'test-id',
                    label: 'Parent DAO',
                    daoId: 'test-id',
                    isAll: false,
                    isParent: true,
                    onlyParent: true,
                },
            ],
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
        useAssetListSpy.mockReturnValue({
            data: {
                pages: [
                    {
                        metadata: { totalRecords: 12 },
                    },
                ],
            },
        } as unknown as ReturnType<typeof financeService.useAssetList>);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const createTestComponent = (
        props?: Partial<IDaoTransactionsPageClientProps>,
    ) => {
        const completeProps: IDaoTransactionsPageClientProps = {
            id: 'test-id',
            initialParams: { queryParams: {} },
            ...props,
        };

        return (
            <FeatureFlagsProvider initialSnapshot={featureFlagSnapshot}>
                <DaoTransactionsPageClient {...completeProps} />
            </FeatureFlagsProvider>
        );
    };

    it('fetches the DAO with the provided id prop', () => {
        const id = 'new-test-id';
        render(createTestComponent({ id }));
        expect(useDaoSpy).toHaveBeenCalledWith(
            expect.objectContaining({ urlParams: { id } }),
        );
    });

    it('renders the page title, Transactions list tabs and stats for all transactions', () => {
        render(createTestComponent());

        expect(
            screen.getByText(/daoTransactionsPage.main.title/),
        ).toBeInTheDocument();
        expect(
            screen.getByTestId('transaction-list-container'),
        ).toBeInTheDocument();
        expect(screen.getByTestId('all-assets-stats')).toBeInTheDocument();
        expect(
            screen.queryByTestId('transaction-subdao-info'),
        ).not.toBeInTheDocument();
    });

    it('renders SubDAO info when a specific SubDAO is selected', () => {
        const subDao = generateSubDao({ address: '0xplug1' });
        const dao = generateDao({ subDaos: [subDao] });
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: dao }),
        );

        const option = {
            id: subDao.id,
            label: subDao.name,
            daoId: subDao.id,
            isAll: false,
            isParent: false,
        };
        useDaoFilterUrlParamSpy.mockReturnValue({
            activeOption: option,
            setActiveOption: jest.fn(),
            options: [
                {
                    id: 'all',
                    label: 'All transactions',
                    daoId: 'test-id',
                    isAll: true,
                    isParent: false,
                },
                option,
            ],
        });

        render(createTestComponent());

        expect(
            screen.getByTestId('transaction-list-container'),
        ).toBeInTheDocument();
        expect(
            screen.getByTestId('transaction-subdao-info'),
        ).toBeInTheDocument();
        expect(
            screen.queryByTestId('all-assets-stats'),
        ).not.toBeInTheDocument();
    });
});
