import { addressUtils, GukModulesProvider } from '@aragon/gov-ui-kit';
import { QueryClient } from '@tanstack/react-query';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { IProposal } from '@/modules/governance/api/governanceService';
import * as governanceServiceApi from '@/modules/governance/api/governanceService';
import { generateProposal } from '@/modules/governance/testUtils';
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
    const useProposalBySlugSpy = jest.spyOn(
        governanceServiceApi,
        'useProposalBySlug',
    );
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
        useProposalBySlugSpy.mockReturnValue(
            generateReactQueryResultSuccess<IProposal, Error>({
                data: generateProposal({ title: 'Mettydatty' }),
            }),
        );
    });

    afterEach(() => {
        useSafePendingTransactionsSpy.mockReset();
        useDialogContextSpy.mockReset();
        useProposalBySlugSpy.mockReset();
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

    it('renders the Safe transaction heading, confirmation count and queued date', () => {
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
            screen.getByLabelText(
                'app.safe.safePendingTransactionList.item.confirmations (count=1,required=2)',
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'app.safe.safePendingTransactionList.item.confirmationCount (count=1,required=2)',
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'app.safe.safePendingTransactionList.item.transaction',
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
            screen.getByLabelText(
                'app.safe.safePendingTransactionList.item.confirmations (count=1,required=3)',
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'app.safe.safePendingTransactionList.item.confirmationCount (count=1,required=3)',
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
            stageId: 0,
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

        it('renders each distinct associated proposal as an identifier and title link', () => {
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
            expect(screen.getAllByText('Mettydatty')).toHaveLength(2);
            expect(
                screen.getAllByRole('link', { name: /Mettydatty/ }),
            ).toHaveLength(2);
        });

        it('links the proposal title and keeps Review independently actionable', () => {
            mockDao([{ address: '0xPluginOne', slug: 'sat' }]);
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

            const proposalLink = screen.getByRole('link', {
                name: 'SAT-4: Mettydatty',
            });
            expect(proposalLink).toHaveAttribute(
                'href',
                expect.stringContaining('proposals/SAT-4'),
            );
            expect(screen.getByText('SAT-4')).toBeInTheDocument();
            expect(
                within(proposalLink).queryByRole('button'),
            ).not.toBeInTheDocument();
            const queuedLink = screen.getByRole('link', {
                name: /item.queuedOn/,
            });
            expect(queuedLink).toHaveAttribute(
                'href',
                expect.stringContaining('app.safe.global'),
            );
            expect(queuedLink).toHaveAttribute(
                'href',
                expect.stringContaining('0xTxHash'),
            );
            expect(queuedLink).toHaveAttribute('target', '_blank');
            expect(queuedLink).toHaveAttribute(
                'rel',
                expect.stringContaining('noopener'),
            );
            expect(
                within(proposalLink).queryByRole('link'),
            ).not.toBeInTheDocument();
            expect(
                screen.getByRole('button', {
                    name: 'app.safe.safePendingTransactionList.item.review',
                }),
            ).toBeInTheDocument();
        });

        it('uses the Safe transaction link when an association cannot resolve', () => {
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
            const safeLink = screen.getByRole('link', {
                name: 'app.safe.safePendingTransactionList.item.transaction',
            });
            expect(safeLink).toHaveAttribute(
                'href',
                expect.stringContaining('app.safe.global'),
            );
        });

        it('deduplicates repeated correlations to the same proposal', () => {
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

            expect(screen.getAllByText('SAT-4')).toHaveLength(1);
            expect(screen.getByText('Mettydatty')).toBeInTheDocument();
            expect(
                screen.getAllByRole('link', { name: /SAT-4: Mettydatty/ }),
            ).toHaveLength(1);
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
                screen.getByLabelText(
                    'app.safe.safePendingTransactionList.item.confirmations (count=1,required=2)',
                ),
            ).toBeInTheDocument();
            expect(
                screen.getByText(
                    'app.safe.safePendingTransactionList.item.confirmationCount (count=1,required=2)',
                ),
            ).toBeInTheDocument();
            await act(() => jest.advanceTimersByTimeAsync(30_000));
            expect(
                screen.getByLabelText(
                    'app.safe.safePendingTransactionList.item.confirmations (count=2,required=2)',
                ),
            ).toBeInTheDocument();
            expect(
                screen.getByText(
                    'app.safe.safePendingTransactionList.item.confirmationCount (count=2,required=2)',
                ),
            ).toBeInTheDocument();
        } finally {
            view.unmount();
            client.clear();
            getQueue.mockRestore();
            jest.useRealTimers();
        }
    });

    it('routes the whole unassociated card out to the Safe app transaction', () => {
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
            name: 'app.safe.safePendingTransactionList.item.transaction',
        });

        expect(link).toHaveAttribute(
            'href',
            expect.stringContaining('app.safe.global'),
        );
        expect(link).toHaveAttribute(
            'href',
            expect.stringContaining(safeTxHash),
        );
        expect(screen.getByText(/item.queuedOn/)).toBeInTheDocument();
        expect(
            within(link).queryByText(/item.queuedOn/),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByText(addressUtils.truncateHash(safeTxHash)),
        ).not.toBeInTheDocument();
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
