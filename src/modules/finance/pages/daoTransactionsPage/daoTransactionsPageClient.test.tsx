import { act, render, screen } from '@testing-library/react';
import * as financeService from '@/modules/finance/api/financeService';
import { TransactionSide } from '@/modules/finance/api/financeService';
import { TransactionList } from '@/modules/finance/components/transactionList';
import { FinanceDialogId } from '@/modules/finance/constants/financeDialogId';
import * as daoService from '@/shared/api/daoService';
import { Network } from '@/shared/api/daoService';
import * as dialogProvider from '@/shared/components/dialogProvider';
import { FeatureFlagsProvider } from '@/shared/components/featureFlagsProvider';
import type { FeatureFlagSnapshot } from '@/shared/featureFlags';
import * as useDaoExecutePermission from '@/shared/hooks/useDaoExecutePermission';
import * as useDaoFilterUrlParam from '@/shared/hooks/useDaoFilterUrlParam';
import {
    generateDao,
    generateLinkedAccount,
    generateReactQueryResultSuccess,
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
    transactionListFilterParam: 'linkedaccount',
}));

jest.mock('@/modules/finance/components/allAssetsStats', () => ({
    AllAssetsStats: jest.fn(() => <div data-testid="all-assets-stats" />),
}));

jest.mock('@/modules/finance/components/daoInfoAside', () => ({
    DaoInfoAside: jest.fn(() => (
        <div data-testid="transaction-linkedaccount-info" />
    )),
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
    const useDaoExecutePermissionSpy = jest.spyOn(
        useDaoExecutePermission,
        'useDaoExecutePermission',
    );
    const useDialogContextSpy = jest.spyOn(dialogProvider, 'useDialogContext');
    const openDialog = jest.fn();

    const featureFlagSnapshot: FeatureFlagSnapshot[] = [
        {
            key: 'debugPanel',
            name: 'Debug panel',
            description: '',
            enabled: false,
        },
        {
            key: 'linkedAccount',
            name: 'Linked account support',
            description: '',
            enabled: true,
        },
    ];

    beforeEach(() => {
        useDialogContextSpy.mockReturnValue({
            locations: [],
            open: openDialog,
            close: jest.fn(),
            updateOptions: jest.fn(),
        });
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
        useDaoExecutePermissionSpy.mockReturnValue({
            hasPermission: false,
            isLoading: false,
        });
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
            expect.objectContaining({ placeholderData: expect.anything() }),
        );
    });

    it('renders the page title, Transactions list filters and stats for all transactions', () => {
        render(createTestComponent());

        expect(
            screen.getByText(/daoTransactionsPage.main.title/),
        ).toBeInTheDocument();
        expect(
            screen.getByTestId('transaction-list-container'),
        ).toBeInTheDocument();
        expect(screen.getByTestId('all-assets-stats')).toBeInTheDocument();
        expect(
            screen.queryByTestId('transaction-linkedaccount-info'),
        ).not.toBeInTheDocument();
    });

    it('renders linked account info when a specific linked account is selected', () => {
        const linkedAccount = generateLinkedAccount({ address: '0xplug1' });
        const dao = generateDao({ linkedAccounts: [linkedAccount] });
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: dao }),
        );

        const option = {
            id: linkedAccount.id,
            label: linkedAccount.name,
            daoId: linkedAccount.id,
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
            screen.getByTestId('transaction-linkedaccount-info'),
        ).toBeInTheDocument();
        expect(
            screen.queryByTestId('all-assets-stats'),
        ).not.toBeInTheDocument();
    });

    it('hides the new transaction button when the wallet lacks execute permission', () => {
        useDaoExecutePermissionSpy.mockReturnValue({
            hasPermission: false,
            isLoading: false,
        });

        render(createTestComponent());

        expect(
            screen.queryByRole('link', {
                name: /daoTransactionsPage.main.newTransaction/,
            }),
        ).not.toBeInTheDocument();
    });

    it('shows the new transaction button linking to the execute wizard when the wallet has execute permission', () => {
        const dao = generateDao({
            network: Network.ETHEREUM_MAINNET,
            address: '0xdao',
            ens: null,
        });
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: dao }),
        );
        useDaoExecutePermissionSpy.mockReturnValue({
            hasPermission: true,
            isLoading: false,
        });

        render(createTestComponent());

        const button = screen.getByRole('link', {
            name: /daoTransactionsPage.main.newTransaction/,
        });
        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute(
            'href',
            `/dao/${dao.network}/${dao.address}/create/execute`,
        );
    });

    it('passes execution transaction clicks to the transaction detail dialog', () => {
        const dao = generateDao();
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: dao }),
        );
        render(createTestComponent());

        const containerProps = (TransactionList.Container as jest.Mock).mock
            .calls[0][0];
        const transaction = {
            network: Network.ETHEREUM_SEPOLIA,
            blockNumber: 1,
            blockTimestamp: 1_700_000_000,
            fromAddress: '0xfrom',
            toAddress: '0xto',
            value: '0',
            side: TransactionSide.EXECUTION,
            type: 'execution',
            transactionHash: '0xabc',
            id: 'execution-id',
            actionCount: 1,
        };

        act(() => containerProps.onTransactionClick(transaction));

        expect(containerProps.dao).toEqual(dao);
        expect(openDialog).toHaveBeenCalledWith(
            FinanceDialogId.TRANSACTION_DETAIL,
            { params: { dao, transaction } },
        );
    });
});
