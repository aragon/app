import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as NextNavigation from 'next/navigation';
import { TransactionSide } from '@/modules/finance/api/financeService';
import * as transactionExecutionDetails from '@/modules/finance/components/transactionExecutionDetails';
import * as safeExecutionDetails from '@/modules/safe/components/safeExecutionDetails';
import * as safeTransactionSimulation from '@/modules/safe/components/safeTransactionSimulation';
import * as safeTransactionVoting from '@/modules/safe/components/safeTransactionVoting';
import { daoService, Network } from '@/shared/api/daoService';
import {
    generateDao,
    generatePaginatedResponseMetadata,
    generateReactQueryInfiniteResultSuccess,
    ReactQueryWrapper,
} from '@/shared/testUtils';
import * as workspaceQueryService from '../../api/workspaceQueryService';
import {
    WorkspaceCoverageSource,
    WorkspaceCoverageStatus,
    WorkspaceTransactionType,
} from '../../api/workspaceQueryService';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import {
    generateWorkspacePendingTransaction,
    generateWorkspaceQueryResponse,
    generateWorkspaceTransaction,
} from '../../testUtils';
import { workspaceSafeTransactionParam } from '../../utils/workspaceTransactionUtils';
import {
    type IWorkspaceTransactionListProps,
    WorkspaceTransactionList,
} from './workspaceTransactionList';

describe('<WorkspaceTransactionList /> component', () => {
    const address = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const otherAddress = '0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419';
    const account = { network: Network.ETHEREUM_SEPOLIA, address };

    const useWorkspaceTransactionsSpy = jest.spyOn(
        workspaceQueryService,
        'useWorkspaceTransactions',
    );
    const getDaoSpy = jest.spyOn(daoService, 'getDao');
    const transactionExecutionDetailsSpy = jest.spyOn(
        transactionExecutionDetails,
        'TransactionExecutionDetails',
    );
    const safeExecutionDetailsSpy = jest.spyOn(
        safeExecutionDetails,
        'SafeExecutionDetails',
    );
    const safeTransactionVotingSpy = jest.spyOn(
        safeTransactionVoting,
        'SafeTransactionVoting',
    );
    const safeTransactionSimulationSpy = jest.spyOn(
        safeTransactionSimulation,
        'SafeTransactionSimulation',
    );

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

    const buildCoverage = (
        status: workspaceQueryService.WorkspaceCoverageStatus,
    ) => [
        {
            account: { network: account.network, address: account.address },
            resource: 'transactions',
            source: WorkspaceCoverageSource.SAFE,
            status,
        },
    ];

    const buildResult = (
        transactions: workspaceQueryService.IWorkspaceTransaction[],
        options?: {
            totalRecords?: number;
            coverageStatus?: WorkspaceCoverageStatus;
            partial?: boolean;
        },
    ) =>
        generateReactQueryInfiniteResultSuccess({
            data: {
                pages: [
                    generateWorkspaceQueryResponse({
                        data: transactions,
                        partial: options?.partial ?? false,
                        coverage: options?.coverageStatus
                            ? buildCoverage(options.coverageStatus)
                            : [],
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
        options?: {
            coverageStatus?: WorkspaceCoverageStatus;
            partial?: boolean;
        },
    ) => {
        useWorkspaceTransactionsSpy.mockImplementation((params) => {
            const isProbe = params.body.pagination?.pageSize === 1;

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
        transactionExecutionDetailsSpy.mockReturnValue(
            <div>execution-detail</div>,
        );
        safeExecutionDetailsSpy.mockReturnValue(
            <div>safe-execution-detail</div>,
        );
        safeTransactionVotingSpy.mockReturnValue(
            <div>safe-transaction-voting</div>,
        );
        safeTransactionSimulationSpy.mockReturnValue(
            <div>safe-transaction-simulation</div>,
        );
    });

    afterEach(() => {
        useWorkspaceTransactionsSpy.mockReset();
        getDaoSpy.mockReset();
        transactionExecutionDetailsSpy.mockReset();
        safeExecutionDetailsSpy.mockReset();
        safeTransactionVotingSpy.mockReset();
        safeTransactionSimulationSpy.mockReset();
    });

    // The query client must sit inside the gov-ui-kit provider: that provider carries a query client of its own,
    // which would otherwise shadow this one and share its cache with every other test of this file.
    const createTestComponent = (
        props?: Partial<IWorkspaceTransactionListProps>,
    ) => {
        const completeProps: IWorkspaceTransactionListProps = {
            accounts: [buildAccount()],
            pageSize: 20,
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
                body: {
                    accounts: [account],
                    filters: { side: TransactionSide.WITHDRAW },
                    pagination: { pageSize: 20 },
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

    it('renders no partial warning when a Safe reports unverified coverage', () => {
        mockTransactions([generateWorkspaceTransaction({ account })], {
            coverageStatus: WorkspaceCoverageStatus.UNVERIFIED,
            partial: true,
        });

        render(createTestComponent({ accounts: [buildAccount()] }));

        expect(
            screen.queryByText(
                'app.workspace.workspaceTransactionList.partialSingle',
            ),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByText(
                'app.workspace.workspaceTransactionList.partial',
            ),
        ).not.toBeInTheDocument();
    });

    it('warns that the list is incomplete when an account could not be read', () => {
        mockTransactions([generateWorkspaceTransaction({ account })], {
            coverageStatus: WorkspaceCoverageStatus.UNAVAILABLE,
        });

        render(
            createTestComponent({
                accounts: [
                    buildAccount(),
                    buildAccount({
                        id: `${Network.ETHEREUM_SEPOLIA}-${otherAddress}`,
                        address: otherAddress,
                    }),
                ],
            }),
        );

        expect(
            screen.getByText('app.workspace.workspaceTransactionList.partial'),
        ).toBeInTheDocument();
    });

    // A single-account view is the account, so saying "some accounts" would only raise the question of which one.
    it('warns about the account itself when it is the only one of the selection', () => {
        mockTransactions([generateWorkspaceTransaction({ account })], {
            coverageStatus: WorkspaceCoverageStatus.UNAVAILABLE,
        });

        render(createTestComponent({ accounts: [buildAccount()] }));

        expect(
            screen.getByText(
                'app.workspace.workspaceTransactionList.partialSingle',
            ),
        ).toBeInTheDocument();
        expect(
            screen.queryByText(
                'app.workspace.workspaceTransactionList.partial',
            ),
        ).not.toBeInTheDocument();
    });

    it('does not warn when every account could be read', () => {
        render(createTestComponent());

        expect(
            screen.queryByText(
                'app.workspace.workspaceTransactionList.partial',
            ),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByText(
                'app.workspace.workspaceTransactionList.partialSingle',
            ),
        ).not.toBeInTheDocument();
    });

    it('expands an execution to its detail in the context of the DAO that emitted it', async () => {
        const dao = generateDao({ ...account, name: 'Test DAO' });
        getDaoSpy.mockResolvedValue(dao);

        const transaction = generateWorkspaceTransaction({
            account,
            side: TransactionSide.EXECUTION,
            source: 'router',
        });
        mockTransactions([transaction]);

        render(createTestComponent());

        const header = await screen.findByRole('button', { name: /router/ });
        await userEvent.click(header);

        expect(screen.getByText('execution-detail')).toBeInTheDocument();
        expect(transactionExecutionDetailsSpy).toHaveBeenCalledWith(
            { dao, transaction },
            undefined,
        );
    });

    it('expands an execution of a Safe account to its detail read from the Safe', async () => {
        const transaction = generateWorkspaceTransaction({
            account,
            side: TransactionSide.EXECUTION,
            source: 'safe',
            safeTxHash: '0xff54',
        });
        mockTransactions([transaction]);

        render(
            createTestComponent({
                accounts: [buildAccount({ type: WorkspaceAccountType.SAFE })],
            }),
        );

        const header = await screen.findByRole('button', {
            name: /status\.executed/,
        });
        await userEvent.click(header);

        expect(screen.getByText('safe-execution-detail')).toBeInTheDocument();
        expect(safeExecutionDetailsSpy).toHaveBeenCalledWith(
            { safeAddress: address, safeTxHash: '0xff54', transaction },
            undefined,
        );
        expect(getDaoSpy).not.toHaveBeenCalled();
    });

    it('expands the two rows of a transfer between selected accounts independently', async () => {
        const otherAccount = {
            network: account.network,
            address: otherAddress,
        };
        const transfer = { id: 'transfer-id', internal: true };
        mockTransactions([
            generateWorkspaceTransaction({ ...transfer, account }),
            generateWorkspaceTransaction({
                ...transfer,
                account: otherAccount,
            }),
        ]);

        render(
            createTestComponent({
                accounts: [
                    buildAccount(),
                    buildAccount({
                        id: `${Network.ETHEREUM_SEPOLIA}-${otherAddress}`,
                        address: otherAddress,
                    }),
                ],
            }),
        );

        const [firstRow, secondRow] = await screen.findAllByRole('button', {
            name: /Received/,
        });
        await userEvent.click(firstRow);

        expect(firstRow).toHaveAttribute('aria-expanded', 'true');
        expect(secondRow).toHaveAttribute('aria-expanded', 'false');
    });

    describe('linked Safe transaction', () => {
        const useSearchParamsSpy = jest.spyOn(
            NextNavigation,
            'useSearchParams',
        );

        const safeAccount = buildAccount({ type: WorkspaceAccountType.SAFE });

        const mockSearchParams = (params?: Record<string, string>) =>
            useSearchParamsSpy.mockReturnValue(
                new URLSearchParams(params) as unknown as ReturnType<
                    typeof NextNavigation.useSearchParams
                >,
            );

        const renderLinked = (safeTxHash: string) => {
            mockSearchParams({ [workspaceSafeTransactionParam]: safeTxHash });
            mockTransactions([
                generateWorkspacePendingTransaction({
                    account,
                    id: 'queued',
                    safeTxHash: '0xff54',
                }),
                generateWorkspaceTransaction({ account, id: 'transfer' }),
            ]);

            return render(createTestComponent({ accounts: [safeAccount] }));
        };

        // Back to the empty parameters the other tests of this file read.
        afterEach(() => {
            mockSearchParams();
        });

        it('expands the transaction the URL names on arrival', async () => {
            renderLinked('0xFF54');

            expect(
                await screen.findByText('safe-execution-detail'),
            ).toBeInTheDocument();
        });

        it('lets the reader collapse the linked transaction', async () => {
            renderLinked('0xff54');

            await userEvent.click(
                await screen.findByRole('button', { name: /status\.active/ }),
            );

            expect(
                screen.queryByText('safe-execution-detail'),
            ).not.toBeInTheDocument();
        });

        it('expands nothing when the URL names a transaction that is not listed', async () => {
            renderLinked('0xother');

            expect(
                await screen.findByRole('button', { name: /status\.active/ }),
            ).toBeInTheDocument();
            expect(
                screen.queryByText('safe-execution-detail'),
            ).not.toBeInTheDocument();
        });
    });

    // The rows reach their accordion through context, so the data list container still counts and paginates them.
    it('renders one page of rows at a time', async () => {
        mockTransactions([
            generateWorkspaceTransaction({ account, id: 'first' }),
            generateWorkspaceTransaction({ account, id: 'second' }),
            generateWorkspaceTransaction({ account, id: 'third' }),
        ]);

        // A page size of one would make the rows query read as an availability probe of the mock.
        render(createTestComponent({ pageSize: 2 }));

        expect(
            await screen.findAllByRole('button', { name: /Received/ }),
        ).toHaveLength(2);
    });

    // A row without its DAO is the block-explorer link of the accounts that have none, so rendering the rows before
    // the DAOs resolve would turn the executions of a DAO from links into accordions under the user's cursor.
    it('keeps the list loading until the DAOs of the accounts are read', async () => {
        let resolveDao: (dao: ReturnType<typeof generateDao>) => void = () =>
            undefined;
        getDaoSpy.mockReturnValue(
            new Promise((resolve) => {
                resolveDao = resolve;
            }),
        );
        mockTransactions([
            generateWorkspaceTransaction({
                account,
                side: TransactionSide.EXECUTION,
                source: 'router',
            }),
        ]);

        render(createTestComponent());

        expect(screen.queryByText('router')).not.toBeInTheDocument();
        expect(screen.queryByRole('link')).not.toBeInTheDocument();

        resolveDao(generateDao({ ...account }));

        expect(
            await screen.findByRole('button', { name: /router/ }),
        ).toBeInTheDocument();
    });
});
