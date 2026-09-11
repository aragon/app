import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { TransactionSide } from '@/modules/finance/api/financeService';
import { FinanceDialogId } from '@/modules/finance/constants/financeDialogId';
import { daoService, Network } from '@/shared/api/daoService';
import * as dialogProvider from '@/shared/components/dialogProvider';
import {
    generateDao,
    generateDialogContext,
    generatePaginatedResponseMetadata,
    generateReactQueryInfiniteResultSuccess,
    ReactQueryWrapper,
} from '@/shared/testUtils';
import * as workspaceQueryService from '../../api/workspaceQueryService';
import { WorkspaceTransactionType } from '../../api/workspaceQueryService';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import {
    generateWorkspaceQueryResponse,
    generateWorkspaceTransaction,
} from '../../testUtils';
import {
    type IWorkspaceTransactionListProps,
    WorkspaceTransactionList,
} from './workspaceTransactionList';

describe('<WorkspaceTransactionList /> component', () => {
    const address = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const account = { network: Network.ETHEREUM_SEPOLIA, address };

    const useWorkspaceTransactionsSpy = jest.spyOn(
        workspaceQueryService,
        'useWorkspaceTransactions',
    );
    const getDaoSpy = jest.spyOn(daoService, 'getDao');
    const useDialogContextSpy = jest.spyOn(dialogProvider, 'useDialogContext');

    const buildAccount = (
        account?: Partial<IWorkspaceAccount>,
    ): IWorkspaceAccount => ({
        id: `${Network.ETHEREUM_SEPOLIA}-${address}`,
        type: WorkspaceAccountType.DAO,
        address,
        network: Network.ETHEREUM_SEPOLIA,
        ...account,
    });

    // Rows of each transaction type, used to decide which toggles the component may render.
    let typeAvailability = { received: 1, sent: 1, executions: 1 };

    const buildResult = (
        transactions: workspaceQueryService.IWorkspaceTransaction[],
        options?: { totalRecords?: number; partial?: boolean },
    ) =>
        generateReactQueryInfiniteResultSuccess({
            data: {
                pages: [
                    generateWorkspaceQueryResponse({
                        data: transactions,
                        partial: options?.partial ?? false,
                        metadata: generatePaginatedResponseMetadata({
                            page: 1,
                            totalPages: 1,
                            totalRecords:
                                options?.totalRecords ?? transactions.length,
                        }),
                    }),
                ],
                pageParams: [],
            },
        }) as unknown as ReturnType<
            typeof workspaceQueryService.useWorkspaceTransactions
        >;

    /**
     * The component asks the same hook for the rows and for the three availability probes, which are told apart by
     * their page size of one.
     */
    const mockTransactions = (
        transactions: workspaceQueryService.IWorkspaceTransaction[] = [
            generateWorkspaceTransaction({ account }),
        ],
        options?: { partial?: boolean },
    ) => {
        useWorkspaceTransactionsSpy.mockImplementation((params) => {
            const isProbe = params.queryParams.pageSize === 1;

            if (!isProbe) {
                return buildResult(transactions, options);
            }

            const { side, type } = params.body.filters ?? {};
            const records =
                type === WorkspaceTransactionType.EXECUTION
                    ? typeAvailability.executions
                    : side === TransactionSide.DEPOSIT
                      ? typeAvailability.received
                      : typeAvailability.sent;

            return buildResult([], { totalRecords: records });
        });
    };

    beforeEach(() => {
        typeAvailability = { received: 1, sent: 1, executions: 1 };
        mockTransactions();
        getDaoSpy.mockResolvedValue(generateDao({ ...account }));
        useDialogContextSpy.mockReturnValue(generateDialogContext());
    });

    afterEach(() => {
        useWorkspaceTransactionsSpy.mockReset();
        getDaoSpy.mockReset();
        useDialogContextSpy.mockReset();
    });

    // The query client must sit inside the gov-ui-kit provider: that provider carries a query client of its own,
    // which would otherwise shadow this one and share its cache with every other test of this file.
    const createTestComponent = (
        props?: Partial<IWorkspaceTransactionListProps>,
    ) => {
        const completeProps: IWorkspaceTransactionListProps = {
            accounts: [buildAccount()],
            initialParams: { queryParams: { pageSize: 20 } },
            ...props,
        };

        return (
            <GukModulesProvider>
                <ReactQueryWrapper client={new QueryClient()}>
                    <WorkspaceTransactionList {...completeProps} />
                </ReactQueryWrapper>
            </GukModulesProvider>
        );
    };

    it('renders a toggle for each transaction type that has rows', () => {
        render(createTestComponent());

        for (const filter of ['all', 'executions', 'received', 'sent']) {
            expect(
                screen.getByText(
                    `app.workspace.workspaceTransactionList.typeFilter.${filter}`,
                ),
            ).toBeInTheDocument();
        }
    });

    it('hides the toggle of a transaction type that has no rows', () => {
        typeAvailability = { received: 1, sent: 1, executions: 0 };
        mockTransactions();

        render(createTestComponent());

        expect(
            screen.queryByText(
                'app.workspace.workspaceTransactionList.typeFilter.executions',
            ),
        ).not.toBeInTheDocument();
        expect(
            screen.getByText(
                'app.workspace.workspaceTransactionList.typeFilter.received',
            ),
        ).toBeInTheDocument();
    });

    it('filters the transactions by the selected type', async () => {
        render(createTestComponent());

        await userEvent.click(
            screen.getByText(
                'app.workspace.workspaceTransactionList.typeFilter.sent',
            ),
        );

        expect(useWorkspaceTransactionsSpy).toHaveBeenCalledWith(
            {
                queryParams: { pageSize: 20 },
                body: {
                    accounts: [account],
                    filters: { side: TransactionSide.WITHDRAW },
                },
            },
            expect.anything(),
        );
    });

    it('does not render the type toggles when only one type has rows', () => {
        typeAvailability = { received: 1, sent: 0, executions: 0 };
        mockTransactions();

        render(createTestComponent());

        expect(
            screen.queryByText(
                'app.workspace.workspaceTransactionList.typeFilter.all',
            ),
        ).not.toBeInTheDocument();
    });

    it('renders the account filter options and reports the selected one', async () => {
        const onSelect = jest.fn();
        render(
            createTestComponent({
                accountFilter: {
                    options: [
                        { id: 'all', label: 'All accounts' },
                        { id: 'account-1', label: 'Demo DAO' },
                    ],
                    value: 'all',
                    onSelect,
                },
            }),
        );

        await userEvent.click(
            screen.getByRole('button', { name: 'All accounts' }),
        );
        await userEvent.click(screen.getByText('Demo DAO'));

        expect(onSelect).toHaveBeenCalledWith('account-1');
    });

    it('does not render the account filter when the page provides none', () => {
        render(createTestComponent());

        expect(screen.queryByText('All accounts')).not.toBeInTheDocument();
    });

    it('warns that the list is incomplete when the response is partial', () => {
        mockTransactions([generateWorkspaceTransaction({ account })], {
            partial: true,
        });

        render(createTestComponent());

        expect(
            screen.getByText('app.workspace.workspaceTransactionList.partial'),
        ).toBeInTheDocument();
    });

    it('does not warn when every account could be read', () => {
        render(createTestComponent());

        expect(
            screen.queryByText(
                'app.workspace.workspaceTransactionList.partial',
            ),
        ).not.toBeInTheDocument();
    });

    it('opens the transaction detail dialog with the DAO of the clicked execution', async () => {
        const dialogContext = generateDialogContext();
        useDialogContextSpy.mockReturnValue(dialogContext);

        const dao = generateDao({ ...account, name: 'Test DAO' });
        getDaoSpy.mockResolvedValue(dao);

        const transaction = generateWorkspaceTransaction({
            account,
            side: TransactionSide.EXECUTION,
            source: 'router',
        });
        mockTransactions([transaction]);

        render(createTestComponent());

        // The row links to the block explorer until its DAO resolves, at which point it becomes the dialog
        // trigger, so the link is only clicked once the execution label is on screen.
        await screen.findByText('router');
        await waitFor(() => expect(getDaoSpy).toHaveBeenCalled());
        await userEvent.click(screen.getByRole('link'));

        expect(dialogContext.open).toHaveBeenCalledWith(
            FinanceDialogId.TRANSACTION_DETAIL,
            { params: { dao, transaction } },
        );
    });
});
