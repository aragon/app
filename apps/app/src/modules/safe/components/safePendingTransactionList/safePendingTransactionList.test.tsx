import { addressUtils, GukModulesProvider } from '@aragon/gov-ui-kit';
import { QueryClient } from '@tanstack/react-query';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as walletAccountApi from '@/modules/application/hooks/useWalletAccount';
import * as daoServiceApi from '@/shared/api/daoService';
import {
    type IDao,
    Network,
    PluginInterfaceType,
} from '@/shared/api/daoService';
import type {
    ISafeMultisigTransaction,
    ISafeQueueResponse,
} from '@/shared/api/safeService';
import * as safeServiceApi from '@/shared/api/safeService';
import { useSafePendingTransactions } from '@/shared/api/safeService/queries/useSafePendingTransactions/useSafePendingTransactions';
import * as dialogProvider from '@/shared/components/dialogProvider';
import {
    generateDao,
    generateDaoPlugin,
    generateDialogContext,
    generateReactQueryResultSuccess,
    generateSafeConfirmation,
    generateSafeQueueResponse,
    generateSafeTransaction,
} from '@/shared/testUtils';
import { SafeDialogId } from '../../constants';
import * as safeTransactionActionsApi from '../../hooks/useSafeTransactionActions';
import {
    type ISafePendingTransactionListProps,
    SafePendingTransactionList,
} from './safePendingTransactionList';

describe('<SafePendingTransactionList /> component', () => {
    const useSafePendingTransactionsSpy = jest.spyOn(
        safeServiceApi,
        'useSafePendingTransactions',
    );
    const useDialogContextSpy = jest.spyOn(dialogProvider, 'useDialogContext');
    const useDaoSpy = jest.spyOn(daoServiceApi, 'useDao');
    const openDialog = jest.fn();

    const generateResponse = (results: ISafeMultisigTransaction[]) =>
        generateReactQueryResultSuccess<ISafeQueueResponse, Error>({
            data: generateSafeQueueResponse({
                count: results.length,
                results,
            }),
        });

    beforeEach(() => {
        useSafePendingTransactionsSpy.mockReturnValue(generateResponse([]));
        useDialogContextSpy.mockReturnValue(
            generateDialogContext({ open: openDialog }),
        );
    });

    afterEach(() => {
        useSafePendingTransactionsSpy.mockReset();
        useDialogContextSpy.mockReset();
        openDialog.mockReset();
    });

    const createTestComponent = (
        props?: Partial<ISafePendingTransactionListProps>,
        // The provider owns a module-level singleton client by default, which would leak cached
        // queue entries between tests that exercise the real query.
        queryClient?: QueryClient,
    ) => {
        const completeProps: ISafePendingTransactionListProps = {
            network: Network.ETHEREUM_MAINNET,
            address: '0x1c8Cae0e29e1a0dc65f0f0E4C74DCE9f9C9F4a2B',
            currentNonce: '10',
            chainId: 1,
            safeVersion: '1.4.1',
            ...props,
        };

        return (
            <GukModulesProvider queryClient={queryClient}>
                <SafePendingTransactionList {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders the nonce and confirmation progress of every queued transaction', () => {
        useSafePendingTransactionsSpy.mockReturnValue(
            generateResponse([
                generateSafeTransaction({
                    nonce: '11',
                    safeTxHash: '0xTxHash',
                    confirmations: [generateSafeConfirmation()],
                    confirmationsRequired: 2,
                }),
            ]),
        );
        render(createTestComponent());

        expect(
            screen.getByText(
                'app.safe.safePendingTransactionList.item.confirmations (count=1,required=2)',
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'app.safe.safePendingTransactionList.item.nonce (nonce=11)',
            ),
        ).toBeInTheDocument();
    });

    it('states the threshold read from the Safe, not the one the service reported', async () => {
        // `confirmationsRequired` is service-derived and sits outside the EIP-712 struct, so no
        // hash comparison can catch a wrong value. Deflated, it would flip the row to "Execute"
        // and stop asking owners whose signature is still required.
        useSafePendingTransactionsSpy.mockReturnValue(
            generateResponse([
                generateSafeTransaction({
                    nonce: '11',
                    safeTxHash: '0xTxHash',
                    confirmations: [generateSafeConfirmation()],
                    confirmationsRequired: 1,
                }),
            ]),
        );
        render(createTestComponent({ threshold: 3 }));

        expect(
            screen.getByText(
                'app.safe.safePendingTransactionList.item.confirmations (count=1,required=3)',
            ),
        ).toBeInTheDocument();
        // The action the row offers follows the same source: the confirm label reaches the review
        // dialog, so a deflated reported value must not turn this into an execution.
        await userEvent.click(
            screen.getByText('app.safe.safePendingTransactionList.item.review'),
        );
        expect(openDialog).toHaveBeenCalledWith(
            SafeDialogId.TRANSACTION_REVIEW,
            expect.objectContaining({
                params: expect.objectContaining({
                    confirmLabel:
                        'app.safe.safePendingTransactionList.item.confirm',
                }),
            }),
        );
    });

    it('renders an empty state when the queue is empty', () => {
        render(createTestComponent());

        expect(
            screen.getByText(
                'app.safe.safePendingTransactionList.empty.heading',
            ),
        ).toBeInTheDocument();
    });

    describe('correlated Aragon proposals', () => {
        const report = {
            daoId: 'ethereum-sepolia-0xDaoOne',
            bodyId: '0xPluginOne',
            proposalId: 4,
            stageId: '0',
            resultType: 2,
        };

        // `getDaoPlugins` drops plugins whose interface type is UNKNOWN, which is the generator's
        // default, so a report would never resolve against one.
        const mockDao = (plugins: Array<{ address: string; slug: string }>) =>
            useDaoSpy.mockReturnValue(
                generateReactQueryResultSuccess<IDao, Error>({
                    data: generateDao({
                        plugins: plugins.map(({ address, slug }) =>
                            generateDaoPlugin({
                                address,
                                slug,
                                interfaceType: PluginInterfaceType.SPP,
                            }),
                        ),
                    }),
                }) as ReturnType<typeof daoServiceApi.useDao>,
            );

        it('links every proposal a batch reports to, so a multi-report payload is not reduced to one', () => {
            mockDao([
                { address: '0xPluginOne', slug: 'sat' },
                { address: '0xPluginTwo', slug: 'crt' },
            ]);
            useSafePendingTransactionsSpy.mockReturnValue(
                generateResponse([
                    generateSafeTransaction({
                        nonce: '11',
                        aragonReports: [
                            report,
                            { ...report, bodyId: '0xPluginTwo', proposalId: 7 },
                        ],
                    }),
                ]),
            );
            render(createTestComponent());

            expect(screen.getByText('SAT-4')).toBeInTheDocument();
            expect(screen.getByText('CRT-7')).toBeInTheDocument();
        });

        it('keeps the Safe app link when a report names a plugin the DAO does not have, rather than rendering a dead link', () => {
            mockDao([{ address: '0xOtherPlugin', slug: 'oth' }]);
            useSafePendingTransactionsSpy.mockReturnValue(
                generateResponse([
                    generateSafeTransaction({
                        nonce: '11',
                        safeTxHash: '0xTxHash',
                        aragonReports: [report],
                    }),
                ]),
            );
            render(createTestComponent());

            expect(screen.queryByText(/^SAT-/)).not.toBeInTheDocument();
            // Plain text, not nothing: rendering nothing left the row's "Reports to" label with
            // no object and hid that the transaction is a governance report at all.
            expect(
                screen.getByText(
                    'app.safe.safePendingTransactionList.item.reportUnidentified',
                ),
            ).toBeInTheDocument();
            expect(
                screen.getByText(addressUtils.truncateHash('0xTxHash')),
            ).toBeInTheDocument();
        });

        it('drops a malformed report without costing the row, because the queue guard deliberately ignores the field', () => {
            mockDao([{ address: '0xPluginOne', slug: 'sat' }]);
            useSafePendingTransactionsSpy.mockReturnValue(
                generateResponse([
                    generateSafeTransaction({
                        nonce: '11',
                        safeTxHash: '0xTxHash',
                        aragonReports: [
                            { daoId: 'ethereum-sepolia-0xDaoOne' },
                        ] as never,
                    }),
                ]),
            );
            render(createTestComponent());

            expect(screen.queryByText(/^SAT-/)).not.toBeInTheDocument();
            expect(
                screen.getByText(addressUtils.truncateHash('0xTxHash')),
            ).toBeInTheDocument();
            expect(
                screen.getByText(
                    'app.safe.safePendingTransactionList.item.nonce (nonce=11)',
                ),
            ).toBeInTheDocument();
        });

        it('renders no report links when the backend sent none', () => {
            mockDao([{ address: '0xPluginOne', slug: 'sat' }]);
            useSafePendingTransactionsSpy.mockReturnValue(
                generateResponse([generateSafeTransaction({ nonce: '11' })]),
            );
            render(createTestComponent());

            expect(
                screen.queryByText(
                    'app.safe.safePendingTransactionList.item.reportsTo',
                ),
            ).not.toBeInTheDocument();
        });

        it('says which verdict a report carries, so an approval and a veto do not render alike', () => {
            mockDao([{ address: '0xPluginOne', slug: 'sat' }]);
            useSafePendingTransactionsSpy.mockReturnValue(
                generateResponse([
                    generateSafeTransaction({
                        nonce: '11',
                        aragonReports: [{ ...report, resultType: 2 }],
                    }),
                ]),
            );
            render(createTestComponent());

            expect(screen.getByText('SAT-4')).toBeInTheDocument();
            expect(
                screen.getByText(
                    'app.safe.safePendingTransactionList.item.reportVetoes',
                ),
            ).toBeInTheDocument();
        });

        it('says a transaction is an unidentified report when the backend decoded one but resolved none', () => {
            // `[]` is information, not silence (app-backend#1574): the calldata is a governance
            // report whose target is not yet indexed, was refused by the body check, or whose
            // correlation read failed. Rendering it like an ordinary transfer discards that.
            mockDao([{ address: '0xPluginOne', slug: 'sat' }]);
            useSafePendingTransactionsSpy.mockReturnValue(
                generateResponse([
                    generateSafeTransaction({
                        nonce: '11',
                        aragonReports: [],
                    }),
                ]),
            );
            render(createTestComponent());

            expect(
                screen.getByText(
                    'app.safe.safePendingTransactionList.item.reportsToUnresolved',
                ),
            ).toBeInTheDocument();
            expect(
                screen.queryByText(
                    'app.safe.safePendingTransactionList.item.reportsTo',
                ),
            ).not.toBeInTheDocument();
        });

        it('keeps a duplicated report visible, because two conflicting results must not read as agreement', () => {
            mockDao([{ address: '0xPluginOne', slug: 'sat' }]);
            useSafePendingTransactionsSpy.mockReturnValue(
                generateResponse([
                    generateSafeTransaction({
                        nonce: '11',
                        aragonReports: [report, { ...report, resultType: 1 }],
                    }),
                ]),
            );
            render(createTestComponent());

            expect(screen.getAllByText('SAT-4')).toHaveLength(2);
        });
    });

    it('hides transactions whose nonce the Safe has already consumed', () => {
        // The backend returns every unexecuted transaction and does not filter by nonce, so a
        // permanently dead one must be dropped here rather than shown as pending.
        useSafePendingTransactionsSpy.mockReturnValue(
            generateResponse([
                generateSafeTransaction({ nonce: '4', safeTxHash: '0xdead' }),
                generateSafeTransaction({ nonce: '6', safeTxHash: '0xlive' }),
            ]),
        );

        render(createTestComponent({ currentNonce: '6' }));

        expect(
            screen.getByText(
                'app.safe.safePendingTransactionList.item.nonce (nonce=6)',
            ),
        ).toBeInTheDocument();
        expect(
            screen.queryByText(
                'app.safe.safePendingTransactionList.item.nonce (nonce=4)',
            ),
        ).not.toBeInTheDocument();
    });

    it('starts the queue request before the current nonce is available', async () => {
        const getQueue = jest
            .spyOn(safeServiceApi.safeService, 'getSafePendingTransactions')
            .mockResolvedValue(generateSafeQueueResponse({ results: [] }));
        useSafePendingTransactionsSpy.mockImplementation(
            useSafePendingTransactions,
        );
        const client = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        });
        const view = render(
            createTestComponent({ currentNonce: undefined }, client),
        );
        try {
            await act(async () => {
                await Promise.resolve();
            });
            expect(getQueue).toHaveBeenCalledTimes(1);
        } finally {
            view.unmount();
            client.clear();
            getQueue.mockRestore();
        }
    });

    it('refreshes confirmations after an initially stale queue response without remounting', async () => {
        jest.useFakeTimers();
        const transaction = generateSafeTransaction({
            nonce: '11',
            confirmations: [generateSafeConfirmation()],
            confirmationsRequired: 2,
        });
        const getQueue = jest
            .spyOn(safeServiceApi.safeService, 'getSafePendingTransactions')
            .mockResolvedValueOnce(
                generateSafeQueueResponse({ results: [transaction] }),
            )
            .mockResolvedValue(
                generateSafeQueueResponse({
                    results: [
                        {
                            ...transaction,
                            confirmations: [
                                ...transaction.confirmations,
                                generateSafeConfirmation({
                                    owner: '0x2222222222222222222222222222222222222222',
                                }),
                            ],
                        },
                    ],
                }),
            );
        useSafePendingTransactionsSpy.mockImplementation(
            useSafePendingTransactions,
        );
        const client = new QueryClient({
            defaultOptions: { queries: { retry: false, staleTime: 60_000 } },
        });
        const view = render(createTestComponent(undefined, client));
        try {
            await act(() => jest.advanceTimersByTimeAsync(100));
            expect(
                screen.getByText(
                    'app.safe.safePendingTransactionList.item.confirmations (count=1,required=2)',
                ),
            ).toBeInTheDocument();
            await act(() => jest.advanceTimersByTimeAsync(30_000));
            expect(
                screen.getByText(
                    'app.safe.safePendingTransactionList.item.confirmations (count=2,required=2)',
                ),
            ).toBeInTheDocument();
        } finally {
            view.unmount();
            client.clear();
            getQueue.mockRestore();
            jest.useRealTimers();
        }
    });

    it('sends the exact queued transaction to review instead of confirming from the list', async () => {
        // The list shows a summary; the payload an owner authorises is the envelope itself. Passing
        // the transaction through keeps the reviewed bytes and the signed bytes the same object.
        const transaction = generateSafeTransaction({
            nonce: '11',
            safeTxHash: '0xTxHash',
        });
        useSafePendingTransactionsSpy.mockReturnValue(
            generateResponse([transaction]),
        );
        render(createTestComponent());

        await userEvent.click(
            screen.getByRole('button', {
                name: 'app.safe.safePendingTransactionList.item.review',
            }),
        );

        expect(openDialog).toHaveBeenCalledWith(
            SafeDialogId.TRANSACTION_REVIEW,
            {
                params: expect.objectContaining({
                    transaction,
                    safeAddress: '0x1c8Cae0e29e1a0dc65f0f0E4C74DCE9f9C9F4a2B',
                    network: Network.ETHEREUM_MAINNET,
                    safeVersion: '1.4.1',
                }),
            },
        );
    });

    it('stops saying a confirmation is not visible yet once the queue returns it', () => {
        // Reconciliation can give up before the backend catches up; the list's own refresh then
        // answers. Showing both the real count and "not available yet" would contradict itself.
        const owner = '0x2222222222222222222222222222222222222222';
        const safeTxHash = '0xTxHash';
        const useWalletAccountSpy = jest.spyOn(
            walletAccountApi,
            'useWalletAccount',
        );
        const useActionsSpy = jest.spyOn(
            safeTransactionActionsApi,
            'useSafeTransactionActions',
        );
        useWalletAccountSpy.mockReturnValue({ address: owner } as never);
        useActionsSpy.mockReturnValue({
            confirm: jest.fn(),
            isConfirming: false,
            submittedConfirmations: new Set([
                `${safeTxHash.toLowerCase()}:${owner.toLowerCase()}`,
            ]),
            confirmationSyncTimedOut: true,
            refreshQueue: jest.fn(),
            execute: jest.fn(),
            isExecuting: false,
        });
        useSafePendingTransactionsSpy.mockReturnValue(
            generateResponse([
                generateSafeTransaction({
                    nonce: '11',
                    safeTxHash,
                    confirmations: [generateSafeConfirmation({ owner })],
                    confirmationsRequired: 2,
                }),
            ]),
        );

        try {
            render(createTestComponent());

            expect(
                screen.getByText(
                    'app.safe.safePendingTransactionList.item.confirmations (count=1,required=2)',
                ),
            ).toBeInTheDocument();
            expect(
                screen.queryByText(
                    'app.safe.safePendingTransactionList.item.submittedUnsynced',
                ),
            ).not.toBeInTheDocument();
            expect(
                screen.queryByRole('button', {
                    name: 'app.safe.safePendingTransactionList.item.refresh',
                }),
            ).not.toBeInTheDocument();
        } finally {
            useWalletAccountSpy.mockRestore();
            useActionsSpy.mockRestore();
        }
    });

    it('links a queued row out to the Safe app, since it cannot correlate to a proposal here', () => {
        // Correlation needs plugin address, proposal id and stage id; this surface has only the
        // network and the Safe, so the Safe app is the honest destination.
        const safeTxHash = `0x${'ab'.repeat(32)}`;
        useSafePendingTransactionsSpy.mockReturnValue(
            generateResponse([
                generateSafeTransaction({ nonce: '11', safeTxHash }),
            ]),
        );

        render(
            createTestComponent({
                network: Network.ETHEREUM_SEPOLIA,
                address: '0x8442c05d620e11009bdaEDdefDA3b5303725c39A',
            }),
        );

        const link = screen.getByRole('link', {
            name: addressUtils.truncateHash(safeTxHash),
        });

        expect(link).toHaveAttribute(
            'href',
            expect.stringContaining('app.safe.global'),
        );
        expect(link).toHaveAttribute(
            'href',
            expect.stringContaining(safeTxHash),
        );
    });
});
