import { addressUtils, GukModulesProvider } from '@aragon/gov-ui-kit';
import { QueryClient } from '@tanstack/react-query';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
            safeVersion: '1.4.1',
            ...props,
        };

        return (
            <GukModulesProvider queryClient={queryClient}>
                <SafePendingTransactionList {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders the title placeholder, confirmations and nonce of every queued transaction', () => {
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
                'app.safe.safePendingTransactionList.item.proposalTitle',
            ),
        ).toBeInTheDocument();
        expect(screen.getAllByText(/item.queuedOn/).length).toBeGreaterThan(0);
    });

    it('states the threshold read from the Safe, not the one the service reported', () => {
        // `confirmationsRequired` is service-derived and sits outside the EIP-712 struct, so no
        // hash comparison can catch a wrong value.
        useSafePendingTransactionsSpy.mockReturnValue(
            generateResponse([
                generateSafeTransaction({
                    nonce: '11',
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
    });

    it('marks a fully signed transaction that is not the Safe next nonce as waiting for turn', () => {
        useSafePendingTransactionsSpy.mockReturnValue(
            generateResponse([
                generateSafeTransaction({
                    nonce: '12',
                    confirmations: [generateSafeConfirmation()],
                }),
            ]),
        );
        render(createTestComponent({ currentNonce: '10', threshold: 1 }));

        expect(
            screen.getByText(
                'app.safe.safePendingTransactionList.item.waitingForTurn (currentNonce=10)',
            ),
        ).toBeInTheDocument();
    });

    it('discloses that two queued transactions share a nonce, because only one can execute', () => {
        useSafePendingTransactionsSpy.mockReturnValue(
            generateResponse([
                generateSafeTransaction({ nonce: '11', safeTxHash: '0xOne' }),
                generateSafeTransaction({ nonce: '11', safeTxHash: '0xTwo' }),
                generateSafeTransaction({ nonce: '12', safeTxHash: '0xThree' }),
            ]),
        );
        render(createTestComponent());

        expect(
            screen.getAllByText(
                'app.safe.safePendingTransactionList.item.nonceRival',
            ),
        ).toHaveLength(2);
    });

    it('says the queue may be out of date when the response is served stale', () => {
        useSafePendingTransactionsSpy.mockReturnValue(
            generateReactQueryResultSuccess<ISafeQueueResponse, Error>({
                data: generateSafeQueueResponse({
                    count: 1,
                    results: [generateSafeTransaction({ nonce: '11' })],
                    meta: { source: 'cache', fetchedAt: '', stale: true },
                }),
            }),
        );
        render(createTestComponent());

        expect(
            screen.getByText('app.safe.safePendingTransactionList.stale'),
        ).toBeInTheDocument();
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
            // The date line still routes the row out externally on a network the Safe app covers.
            expect(screen.getByRole('link')).toBeInTheDocument();
        });

        it('drops a malformed report without costing the row, because the queue guard deliberately ignores the field', () => {
            mockDao([{ address: '0xPluginOne', slug: 'sat' }]);
            useSafePendingTransactionsSpy.mockReturnValue(
                generateResponse([
                    generateSafeTransaction({
                        nonce: '11',
                        aragonReports: [
                            { daoId: 'ethereum-sepolia-0xDaoOne' },
                        ] as never,
                    }),
                ]),
            );
            render(createTestComponent());

            expect(screen.queryByText(/^SAT-/)).not.toBeInTheDocument();
            // A malformed entry costs only itself: it renders as an unidentified report.
            expect(
                screen.getByText(
                    'app.safe.safePendingTransactionList.item.reportUnidentified',
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
            // correlation read failed.
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
        // The consumed nonce is filtered, so only its rival's row remains; the surviving row is
        // the Safe's current nonce and cannot be waiting for turn.
        expect(
            screen.queryByText(
                'app.safe.safePendingTransactionList.item.waitingForTurn (currentNonce=6)',
            ),
        ).not.toBeInTheDocument();
    });

    it('renders every live row with its own submitted line, whatever order the service answered in', () => {
        // The service answers newest first; this surface answers the Safe's nonce sequence.
        useSafePendingTransactionsSpy.mockReturnValue(
            generateResponse([
                generateSafeTransaction({ nonce: '12', safeTxHash: '0xLater' }),
                generateSafeTransaction({ nonce: '6', safeTxHash: '0xNext' }),
                generateSafeTransaction({ nonce: '9', safeTxHash: '0xMiddle' }),
            ]),
        );

        render(createTestComponent({ currentNonce: '6' }));

        // The queued rows survive the sort, each with its own submitted line.
        expect(screen.getAllByText(/item.queuedOn/).length).toBeGreaterThan(0);
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

    it('sends the exact queued transaction to a review-only dialog, with no confirmation action', async () => {
        // Signing stays in the proposal context that produced the transaction; this list reviews
        // the payload and its hashes only.
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
                params: {
                    transaction,
                    safeAddress: '0x1c8Cae0e29e1a0dc65f0f0E4C74DCE9f9C9F4a2B',
                    network: Network.ETHEREUM_MAINNET,
                    safeVersion: '1.4.1',
                },
            },
        );
    });

    it('routes the submitted line out to the Safe app transaction', () => {
        // This surface has only the network and the Safe, so the Safe app is the destination for
        // co-signer state.
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

        const link = screen.getByRole('link');

        expect(link).toHaveAttribute(
            'href',
            expect.stringContaining('app.safe.global'),
        );
        expect(link).toHaveAttribute(
            'href',
            expect.stringContaining(safeTxHash),
        );
        // The submitted text is the link, not the hash itself.
        expect(within(link).getByText(/item.queuedOn/)).toBeInTheDocument();
        expect(
            screen.queryByText(addressUtils.truncateHash(safeTxHash)),
        ).not.toBeInTheDocument();
    });

    it('renders the submitted line as plain text on a network the Safe app does not cover', () => {
        // The queue is a universal surface: on a network with no Safe short name there is no
        // route out, so the line stays text rather than turning into a dead link.
        useSafePendingTransactionsSpy.mockReturnValue(
            generateResponse([generateSafeTransaction({ nonce: '11' })]),
        );
        render(createTestComponent({ network: Network.CITREA_MAINNET }));

        expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });
});
