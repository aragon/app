import { Dialog, GukModulesProvider, IconType } from '@aragon/gov-ui-kit';
import * as ReactQuery from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import type { WaitForTransactionReceiptErrorType } from 'viem';
import * as Wagmi from 'wagmi';
import { ApplicationDialogId } from '@/modules/application/constants/applicationDialogId';
import { Network } from '@/shared/api/daoService';
import * as transactionService from '@/shared/api/transactionService';
import { TransactionType } from '@/shared/api/transactionService';
import * as DialogProviderModule from '@/shared/components/dialogProvider';
import { DialogProvider } from '@/shared/components/dialogProvider/dialogProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { usePendingTransaction } from '@/shared/hooks/usePendingTransaction';
import {
    generateDialogContext,
    generateReactQueryResultError,
    generateReactQueryResultSuccess,
    generateStepperResult,
} from '@/shared/testUtils';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import {
    PendingTransactionStatus,
    pendingTransactionManager,
} from '@/shared/utils/pendingTransactionManager';
import { plausibleAnalyticsUtils } from '@/shared/utils/plausibleAnalyticsUtils';
import type { IStepperStep } from '@/shared/utils/stepperUtils';
import { TransactionDialog } from './transactionDialog';
import {
    type ITransactionDialogProps,
    type ITransactionDialogStepMeta,
    TransactionDialogStep,
} from './transactionDialog.api';
import { transactionDialogUtils } from './transactionDialogUtils';

jest.mock('./transactionDialogFooter', () => ({
    TransactionDialogFooter: () => <div data-testid="footer-mock" />,
}));

jest.mock('next/navigation', () => ({
    useParams: jest.fn(() => ({})),
}));

jest.mock('@tanstack/react-query', () => ({
    __esModule: true,
    ...jest.requireActual<typeof ReactQuery>('@tanstack/react-query'),
}));

jest.mock('@/shared/hooks/usePendingTransaction', () => ({
    usePendingTransaction: jest.fn(),
}));

describe('<TransactionDialog /> component', () => {
    const useSendTransactionSpy = jest.spyOn(Wagmi, 'useSendTransaction');
    const useMutationSpy = jest.spyOn(ReactQuery, 'useMutation');
    const useWaitForTransactionReceiptSpy = jest.spyOn(
        Wagmi,
        'useWaitForTransactionReceipt',
    );
    const useConnectionSpy = jest.spyOn(Wagmi, 'useConnection');
    const useSwitchChainSpy = jest.spyOn(Wagmi, 'useSwitchChain');
    const monitorTransactionErrorSpy = jest.spyOn(
        transactionDialogUtils,
        'monitorTransactionError',
    );
    const usePendingTransactionMock = jest.mocked(usePendingTransaction);
    const managerSendSpy = jest.spyOn(pendingTransactionManager, 'send');
    const managerClearSpy = jest.spyOn(pendingTransactionManager, 'clear');
    const managerGetSpy = jest.spyOn(pendingTransactionManager, 'get');
    const trackAnalyticsSpy = jest.spyOn(plausibleAnalyticsUtils, 'track');

    beforeEach(() => {
        useSendTransactionSpy.mockReturnValue(
            {} as Wagmi.UseSendTransactionReturnType,
        );
        useMutationSpy.mockReturnValue({} as ReactQuery.UseMutationResult);
        useConnectionSpy.mockReturnValue(
            {} as unknown as Wagmi.UseConnectionReturnType,
        );
        useWaitForTransactionReceiptSpy.mockReturnValue(
            {} as Wagmi.UseWaitForTransactionReceiptReturnType,
        );
        useSwitchChainSpy.mockReturnValue({
            mutate: jest.fn(),
        } as unknown as Wagmi.UseSwitchChainReturnType);
        usePendingTransactionMock.mockReturnValue(undefined);
        managerSendSpy.mockImplementation(() => undefined);
        managerClearSpy.mockImplementation(() => undefined);
        managerGetSpy.mockReturnValue(undefined);
        trackAnalyticsSpy.mockImplementation(() => undefined);
    });

    afterEach(() => {
        useSendTransactionSpy.mockReset();
        useMutationSpy.mockReset();
        useConnectionSpy.mockReset();
        useWaitForTransactionReceiptSpy.mockReset();
        useSwitchChainSpy.mockReset();
        monitorTransactionErrorSpy.mockReset();
        usePendingTransactionMock.mockReset();
        managerSendSpy.mockReset();
        managerClearSpy.mockReset();
        managerGetSpy.mockReset();
        trackAnalyticsSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<ITransactionDialogProps>) => {
        const completeProps: ITransactionDialogProps = {
            title: 'title',
            description: 'description',
            intent: { id: 'intent' },
            submitLabel: 'submit',
            stepper: generateStepperResult(),
            prepareTransaction: jest.fn(),
            successLink: { label: '', href: '' },
            ...props,
        };

        return (
            <GukModulesProvider>
                <DialogProvider>
                    <Dialog.Root open={true}>
                        <TransactionDialog {...completeProps} />
                    </Dialog.Root>
                </DialogProvider>
            </GukModulesProvider>
        );
    };

    it('renders the dialog title, description, footer and children prop', () => {
        const title = 'test-title';
        const description = 'test-description';
        const children = 'children';
        render(createTestComponent({ title, description, children }));
        expect(
            screen.getByRole('heading', { level: 2, name: title }),
        ).toBeInTheDocument();
        expect(screen.getByText(description)).toBeInTheDocument();
        expect(screen.getByText(children)).toBeInTheDocument();
        expect(screen.getByTestId('footer-mock')).toBeInTheDocument();
    });

    it('renders the transaction steps', () => {
        const steps = [
            {
                id: TransactionDialogStep.APPROVE,
                order: 0,
                meta: { label: 'approve' } as ITransactionDialogStepMeta,
            },
            {
                id: TransactionDialogStep.CONFIRM,
                order: 1,
                meta: { label: 'confirm' } as ITransactionDialogStepMeta,
            },
        ] as unknown as IStepperStep<ITransactionDialogStepMeta>[];
        const stepper = generateStepperResult({ steps });
        render(createTestComponent({ stepper }));
        expect(screen.getByText(steps[0].meta.label)).toBeInTheDocument();
        expect(screen.getByText(steps[1].meta.label)).toBeInTheDocument();
    });

    it('includes the indexing step when transactionType is provided', () => {
        const updateSteps = jest.fn();
        const stepper = generateStepperResult<
            ITransactionDialogStepMeta,
            string
        >({ updateSteps });

        render(
            createTestComponent({
                stepper,
                transactionType: TransactionType.DAO_CREATE,
            }),
        );

        expect(updateSteps).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({
                    id: TransactionDialogStep.INDEXING,
                }),
            ]),
        );
    });

    it('excludes the indexing step when transactionType is not provided', () => {
        const updateSteps = jest.fn();

        render(createTestComponent());

        expect(updateSteps).not.toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({
                    id: TransactionDialogStep.INDEXING,
                }),
            ]),
        );
    });

    it('automatically triggers the step action when its auto property is set to true and state is idle', async () => {
        const stepAction = jest.fn();
        const steps = [
            {
                id: TransactionDialogStep.PREPARE,
                meta: {
                    label: 'prepare',
                    action: stepAction,
                    auto: true,
                    state: 'idle',
                },
            },
        ] as unknown as IStepperStep<ITransactionDialogStepMeta>[];
        const activeStep = TransactionDialogStep.PREPARE;
        const activeStepIndex = 0;
        const stepper = generateStepperResult({
            steps,
            activeStep,
            activeStepIndex,
        });
        render(createTestComponent({ stepper }));
        await waitFor(() =>
            expect(stepAction).toHaveBeenCalledWith({
                onError: expect.any(Function) as unknown,
            }),
        );
    });

    it('keeps the automatic step action scheduled when analytics props are recreated', () => {
        jest.useFakeTimers();

        const stepAction = jest.fn();
        const steps = [
            {
                id: TransactionDialogStep.PREPARE,
                meta: {
                    label: 'prepare',
                    action: stepAction,
                    auto: true,
                    state: 'idle',
                },
            },
        ] as unknown as IStepperStep<ITransactionDialogStepMeta>[];
        const stepper = generateStepperResult({
            steps,
            activeStep: TransactionDialogStep.PREPARE,
            activeStepIndex: 0,
        });

        try {
            const { rerender } = render(
                createTestComponent({
                    analytics: { flow: 'create_dao' },
                    stepper,
                }),
            );

            act(() => jest.advanceTimersByTime(50));
            rerender(
                createTestComponent({
                    analytics: { flow: 'create_dao' },
                    stepper,
                }),
            );
            act(() => jest.advanceTimersByTime(50));

            expect(stepAction).toHaveBeenCalledWith({
                onError: expect.any(Function) as unknown,
            });
        } finally {
            jest.useRealTimers();
        }
    });

    it('does not trigger the step action when its auto property is set to false', async () => {
        const stepAction = jest.fn();
        const steps = [
            {
                id: TransactionDialogStep.PREPARE,
                meta: {
                    label: 'prepare',
                    action: stepAction,
                    auto: false,
                    state: 'idle',
                },
            },
        ] as unknown as IStepperStep<ITransactionDialogStepMeta>[];
        const activeStep = TransactionDialogStep.PREPARE;
        const activeStepIndex = 0;
        const stepper = generateStepperResult({
            steps,
            activeStep,
            activeStepIndex,
        });
        render(createTestComponent({ stepper }));
        await waitFor(() => expect(stepAction).not.toHaveBeenCalled());
    });

    it('correctly set the transaction steps when having custom steps', () => {
        const stepMetaOne = {
            label: 'pin',
            action: jest.fn(),
            auto: false,
            state: 'idle' as const,
        };
        const stepMetaTwo = {
            label: 'something',
            action: jest.fn(),
            auto: false,
            state: 'idle' as const,
        };
        const customSteps = [
            { id: 'pin-metadata', order: 0, meta: stepMetaOne },
            { id: 'something', order: 1, meta: stepMetaTwo },
        ];
        const expectedSteps = [
            {
                id: TransactionDialogStep.PREPARE,
                order: 2,
                meta: expect.objectContaining({
                    label: expect.stringMatching(/PREPARE.label/) as unknown,
                    errorLabel: expect.stringMatching(
                        /PREPARE.errorLabel/,
                    ) as unknown,
                    auto: true,
                }) as unknown,
            },
            {
                id: TransactionDialogStep.APPROVE,
                order: 3,
                meta: expect.objectContaining({
                    label: expect.stringMatching(/APPROVE.label/) as unknown,
                    errorLabel: expect.stringMatching(
                        /APPROVE.errorLabel/,
                    ) as unknown,
                    auto: false,
                    addon: {
                        label: expect.stringMatching(
                            /APPROVE.addon/,
                        ) as unknown,
                        icon: IconType.BLOCKCHAIN_WALLET,
                    },
                }) as unknown,
            },
            {
                id: TransactionDialogStep.CONFIRM,
                order: 4,
                meta: expect.objectContaining({
                    label: expect.stringMatching(/CONFIRM.label/) as unknown,
                    errorLabel: expect.stringMatching(
                        /CONFIRM.errorLabel/,
                    ) as unknown,
                    auto: false,
                }) as unknown,
            },
        ];
        const updateSteps = jest.fn();
        const stepper = generateStepperResult<
            ITransactionDialogStepMeta,
            string
        >({ updateSteps });
        render(createTestComponent({ customSteps, stepper }));
        expect(updateSteps).toHaveBeenCalledWith([
            ...customSteps,
            ...expectedSteps,
        ]);
    });

    it('prepare transaction step triggers the prepareTransaction callback', async () => {
        const prepareTransaction = jest.fn();
        const updateSteps = jest.fn() as jest.Mock<
            void,
            IStepperStep<ITransactionDialogStepMeta>[][]
        >;
        useMutationSpy.mockReturnValue({
            mutate: prepareTransaction,
        } as unknown as ReactQuery.UseMutationResult);
        const stepper = generateStepperResult<
            ITransactionDialogStepMeta,
            string
        >({ updateSteps });
        render(createTestComponent({ prepareTransaction, stepper }));
        const { action: prepareStepAction } =
            updateSteps.mock.calls[0][0][0].meta;
        act(() => prepareStepAction?.({ onError: jest.fn() }));
        await waitFor(() => expect(prepareTransaction).toHaveBeenCalled());
    });

    it('approve transaction step sends the transaction to the user wallet when network prop matches current chain', () => {
        const transaction = { from: '0x123', data: '0x000' };
        const network = Network.POLYGON_MAINNET;
        useConnectionSpy.mockReturnValue({
            chainId: networkDefinitions[network].id,
        } as unknown as Wagmi.UseConnectionReturnType);
        useMutationSpy.mockReturnValue({
            data: transaction,
        } as unknown as ReactQuery.UseMutationResult);
        const updateSteps = jest.fn() as jest.Mock<
            void,
            IStepperStep<ITransactionDialogStepMeta>[][]
        >;
        const stepper = generateStepperResult<
            ITransactionDialogStepMeta,
            string
        >({ updateSteps });
        render(
            createTestComponent({ stepper, network, intent: { id: 'intent' } }),
        );
        const { action: approveStepAction } =
            updateSteps.mock.calls[0][0][1].meta;
        act(() => approveStepAction?.({ onError: jest.fn() }));
        expect(managerSendSpy).toHaveBeenCalledWith(
            'intent',
            expect.objectContaining(transaction),
            undefined,
        );
    });

    it('tracks a transaction start when the approve step sends the request', () => {
        const transaction = { from: '0x123', data: '0x000' };
        const network = Network.POLYGON_MAINNET;
        useConnectionSpy.mockReturnValue({
            chainId: networkDefinitions[network].id,
        } as unknown as Wagmi.UseConnectionReturnType);
        useMutationSpy.mockReturnValue({
            data: transaction,
        } as unknown as ReactQuery.UseMutationResult);
        const updateSteps = jest.fn() as jest.Mock<
            void,
            IStepperStep<ITransactionDialogStepMeta>[][]
        >;
        const stepper = generateStepperResult<
            ITransactionDialogStepMeta,
            string
        >({ updateSteps });

        render(
            createTestComponent({
                analytics: {
                    flow: 'create_proposal',
                    transactionTypeEvent: 'governance_proposal_create',
                },
                stepper,
                network,
                transactionType: TransactionType.PROPOSAL_CREATE,
                intent: { id: 'intent' },
            }),
        );

        const { action: approveStepAction } =
            updateSteps.mock.calls[0][0][1].meta;
        act(() => approveStepAction?.({ onError: jest.fn() }));

        expect(trackAnalyticsSpy).toHaveBeenCalledWith('transaction_start', {
            flow: 'create_proposal',
            transactionTypeEvent: 'governance_proposal_create',
            network,
            chainId: networkDefinitions[network].id,
            attemptKind: 'new',
        });
    });

    it('does not track a transaction start when analytics are not configured', () => {
        const transaction = { from: '0x123', data: '0x000' };
        const network = Network.POLYGON_MAINNET;
        useConnectionSpy.mockReturnValue({
            chainId: networkDefinitions[network].id,
        } as unknown as Wagmi.UseConnectionReturnType);
        useMutationSpy.mockReturnValue({
            data: transaction,
        } as unknown as ReactQuery.UseMutationResult);
        const updateSteps = jest.fn() as jest.Mock<
            void,
            IStepperStep<ITransactionDialogStepMeta>[][]
        >;
        const stepper = generateStepperResult<
            ITransactionDialogStepMeta,
            string
        >({ updateSteps });

        render(
            createTestComponent({
                stepper,
                network,
                transactionType: TransactionType.PROPOSAL_CREATE,
                intent: { id: 'intent' },
            }),
        );

        const { action: approveStepAction } =
            updateSteps.mock.calls[0][0][1].meta;
        act(() => approveStepAction?.({ onError: jest.fn() }));

        expect(trackAnalyticsSpy).not.toHaveBeenCalled();
    });

    it('derives an intent id from the prepared transaction when none is provided', () => {
        const transaction = { from: '0x123', data: '0x000' };
        const network = Network.POLYGON_MAINNET;
        useConnectionSpy.mockReturnValue({
            chainId: networkDefinitions[network].id,
            address: '0xConnected',
        } as unknown as Wagmi.UseConnectionReturnType);
        useMutationSpy.mockReturnValue({
            data: transaction,
        } as unknown as ReactQuery.UseMutationResult);
        const updateSteps = jest.fn() as jest.Mock<
            void,
            IStepperStep<ITransactionDialogStepMeta>[][]
        >;
        const stepper = generateStepperResult<
            ITransactionDialogStepMeta,
            string
        >({ updateSteps });
        render(createTestComponent({ stepper, network, intent: undefined }));
        const { action: approveStepAction } =
            updateSteps.mock.calls[0][0][1].meta;
        act(() => approveStepAction?.({ onError: jest.fn() }));
        // The derived id is opaque; the action is still sent through the manager keyed by it.
        expect(managerSendSpy).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining(transaction),
            undefined,
        );
    });

    it('approve transaction step switches user network when network prop does not match current chain', () => {
        const network = Network.BASE_MAINNET;
        const switchChain = jest.fn();
        useConnectionSpy.mockReturnValue({
            chainId: networkDefinitions[Network.ARBITRUM_MAINNET].id,
        } as unknown as Wagmi.UseConnectionReturnType);
        useSwitchChainSpy.mockReturnValue({
            mutate: switchChain,
        } as unknown as Wagmi.UseSwitchChainReturnType);
        const updateSteps = jest.fn() as jest.Mock<
            void,
            IStepperStep<ITransactionDialogStepMeta>[][]
        >;
        const stepper = generateStepperResult<
            ITransactionDialogStepMeta,
            string
        >({ updateSteps });
        render(createTestComponent({ stepper, network }));
        const { action: approveStepAction } =
            updateSteps.mock.calls[0][0][1].meta;
        act(() => approveStepAction?.({ onError: jest.fn() }));
        expect(switchChain).toHaveBeenCalledWith(
            { chainId: networkDefinitions[network].id },
            { onSuccess: expect.any(Function) as unknown },
        );
    });

    it('keeps the managed pending state on the approve step even when the wallet is on the wrong chain', () => {
        const network = Network.BASE_MAINNET;
        // Wallet on a different chain than required -> cross-network (would otherwise show idle switch).
        useConnectionSpy.mockReturnValue({
            chainId: networkDefinitions[Network.ARBITRUM_MAINNET].id,
            address: '0xConnected',
        } as unknown as Wagmi.UseConnectionReturnType);
        usePendingTransactionMock.mockReturnValue({
            status: PendingTransactionStatus.PENDING,
        });
        managerGetSpy.mockReturnValue({
            status: PendingTransactionStatus.PENDING,
        });
        const updateSteps = jest.fn() as jest.Mock<
            void,
            IStepperStep<ITransactionDialogStepMeta>[][]
        >;
        const stepper = generateStepperResult<
            ITransactionDialogStepMeta,
            string
        >({ updateSteps });
        render(
            createTestComponent({ stepper, network, intent: { id: 'intent' } }),
        );
        const lastSteps = updateSteps.mock.calls.at(-1)?.[0] ?? [];
        const approveStep = lastSteps.find(
            (step) => step.id === TransactionDialogStep.APPROVE,
        );
        expect(approveStep?.meta.state).toBe('pending');
    });

    it('shows the switch-network alert when the connected chain does not match the required transaction chain', () => {
        const network = Network.BASE_MAINNET;

        useConnectionSpy.mockReturnValue({
            chainId: networkDefinitions[Network.ETHEREUM_MAINNET].id,
        } as unknown as Wagmi.UseConnectionReturnType);

        render(createTestComponent({ network }));

        expect(
            screen.getByText(
                /Switch network|app\.shared\.networkSwitchAlert\.title/,
            ),
        ).toBeInTheDocument();
    });

    it('does not show the switch-network alert when the connected chain already matches the required transaction chain', () => {
        const network = Network.ETHEREUM_MAINNET;

        useConnectionSpy.mockReturnValue({
            chainId: networkDefinitions[network].id,
        } as unknown as Wagmi.UseConnectionReturnType);

        render(createTestComponent({ network }));

        expect(
            screen.queryByText(
                /Switch network|app\.shared\.networkSwitchAlert\.title/,
            ),
        ).not.toBeInTheDocument();
    });

    it('does not send the transaction when transaction is not set at approve step', () => {
        useMutationSpy.mockReturnValue({
            data: null,
        } as unknown as ReactQuery.UseMutationResult);
        const updateSteps = jest.fn() as jest.Mock<
            void,
            IStepperStep<ITransactionDialogStepMeta>[][]
        >;
        const stepper = generateStepperResult<
            ITransactionDialogStepMeta,
            string
        >({ updateSteps });
        render(createTestComponent({ stepper, intent: { id: 'intent' } }));
        const { action: approveStepAction } =
            updateSteps.mock.calls[0][0][1].meta;
        act(() => approveStepAction?.({ onError: jest.fn() }));
        expect(managerSendSpy).not.toHaveBeenCalled();
        // Nothing to send and nothing to re-send -> surfaced, not a silent no-op.
        expect(monitorTransactionErrorSpy).toHaveBeenCalled();
    });

    it('confirmation action step retries sending the transaction and updates active step', () => {
        const transaction = { from: '0x123', data: '0x000' };
        useMutationSpy.mockReturnValue({
            data: transaction,
        } as unknown as ReactQuery.UseMutationResult);
        const updateSteps = jest.fn() as jest.Mock<
            void,
            IStepperStep<ITransactionDialogStepMeta>[][]
        >;
        const updateActiveStep = jest.fn();
        const stepper = generateStepperResult<
            ITransactionDialogStepMeta,
            string
        >({ updateSteps, updateActiveStep });
        render(createTestComponent({ stepper, intent: { id: 'intent' } }));
        const { action: confirmStepAction } =
            updateSteps.mock.calls[0][0][2].meta;
        act(() => confirmStepAction?.({ onError: jest.fn() }));
        expect(managerSendSpy).toHaveBeenCalledWith(
            'intent',
            expect.objectContaining(transaction),
            undefined,
        );
        expect(updateActiveStep).toHaveBeenCalledWith(
            TransactionDialogStep.APPROVE,
        );
    });

    it('displays the link to the block explorer for the confirmation step once a hash is available', () => {
        const transactionHash = '0x1234';
        const network = Network.POLYGON_MAINNET;
        usePendingTransactionMock.mockReturnValue({
            status: PendingTransactionStatus.SUBMITTED,
            hash: transactionHash,
        });
        const updateSteps = jest.fn() as jest.Mock<
            void,
            IStepperStep<ITransactionDialogStepMeta>[][]
        >;
        const stepper = generateStepperResult<
            ITransactionDialogStepMeta,
            string
        >({ updateSteps });
        render(createTestComponent({ stepper, network }));
        const confirmStep = updateSteps.mock.calls[0][0][2];
        expect(confirmStep.meta.addon).toEqual({
            label: expect.stringMatching(/CONFIRM.addon/) as unknown,
            href: `https://polygonscan.com/tx/${transactionHash}`,
        });
    });

    it('resumes to the confirm step when a submitted action already exists for the intent', () => {
        managerGetSpy.mockReturnValue({
            status: PendingTransactionStatus.SUBMITTED,
            hash: '0x1234',
        });
        const updateActiveStep = jest.fn();
        const stepper = generateStepperResult<
            ITransactionDialogStepMeta,
            string
        >({ updateActiveStep });
        render(createTestComponent({ stepper, intent: { id: 'intent' } }));
        expect(updateActiveStep).toHaveBeenCalledWith(
            TransactionDialogStep.CONFIRM,
        );
    });

    it('resumes to the approve step for a live pending request', () => {
        managerGetSpy.mockReturnValue({
            status: PendingTransactionStatus.PENDING,
        });
        const updateActiveStep = jest.fn();
        const stepper = generateStepperResult<
            ITransactionDialogStepMeta,
            string
        >({ updateActiveStep });
        render(createTestComponent({ stepper, intent: { id: 'intent' } }));
        expect(updateActiveStep).toHaveBeenCalledWith(
            TransactionDialogStep.APPROVE,
        );
    });

    it('clears a stale failed record and starts fresh', () => {
        managerGetSpy.mockReturnValue({
            status: PendingTransactionStatus.FAILED,
        });
        const updateActiveStep = jest.fn();
        const stepper = generateStepperResult<
            ITransactionDialogStepMeta,
            string
        >({ updateActiveStep });
        render(createTestComponent({ stepper, intent: { id: 'intent' } }));
        expect(managerClearSpy).toHaveBeenCalledWith('intent');
        expect(updateActiveStep).not.toHaveBeenCalled();
    });

    it('logs an error to the monitoring service when CONFIRM step fails', () => {
        const error =
            'transaction-failed' as unknown as WaitForTransactionReceiptErrorType;
        const waitTxError = {
            queryKey: [''],
            ...generateReactQueryResultError({ error }),
        };
        const address = '0x123';
        useConnectionSpy.mockReturnValue({
            chainId: 1,
            address,
        } as unknown as Wagmi.UseConnectionReturnType);
        useWaitForTransactionReceiptSpy.mockReturnValue(waitTxError);
        render(createTestComponent());
        expect(monitorTransactionErrorSpy).toHaveBeenCalledWith(error, {
            stepId: TransactionDialogStep.CONFIRM,
            from: address,
            transaction: undefined,
        });
        expect(trackAnalyticsSpy).not.toHaveBeenCalled();
    });

    it('tracks a transaction failure without sending the raw error', () => {
        const error = new Error('RPC exploded');
        const waitTxError = {
            queryKey: [''],
            ...generateReactQueryResultError({ error }),
        };
        useWaitForTransactionReceiptSpy.mockReturnValue(
            waitTxError as unknown as Wagmi.UseWaitForTransactionReceiptReturnType,
        );

        render(
            createTestComponent({
                analytics: {
                    flow: 'create_proposal',
                    transactionTypeEvent: 'governance_proposal_create',
                },
                transactionType: TransactionType.PROPOSAL_CREATE,
            }),
        );

        expect(trackAnalyticsSpy).toHaveBeenCalledWith('transaction_failed', {
            flow: 'create_proposal',
            transactionTypeEvent: 'governance_proposal_create',
            network: Network.ETHEREUM_MAINNET,
            chainId: networkDefinitions[Network.ETHEREUM_MAINNET].id,
            step: TransactionDialogStep.CONFIRM,
            errorClass: 'Error',
        });
    });

    it('overrides the approve error label for a known wallet error', () => {
        usePendingTransactionMock.mockReturnValue({
            status: PendingTransactionStatus.FAILED,
            error: new Error(
                'eth_sendRawTransaction: replacement transaction underpriced',
            ),
        });
        const updateSteps = jest.fn() as jest.Mock<
            void,
            IStepperStep<ITransactionDialogStepMeta>[][]
        >;
        const stepper = generateStepperResult<
            ITransactionDialogStepMeta,
            string
        >({ updateSteps });
        render(createTestComponent({ stepper }));
        expect(updateSteps).toHaveBeenLastCalledWith(
            expect.arrayContaining([
                expect.objectContaining({
                    id: TransactionDialogStep.APPROVE,
                    meta: expect.objectContaining({
                        errorLabel: expect.stringMatching(
                            /error.replacementUnderpriced/,
                        ) as unknown,
                    }) as unknown,
                }),
            ]),
        );
    });

    it('resets the record and restarts from prepare when a retry has nothing to re-send', () => {
        const updateActiveStep = jest.fn();
        const updateSteps = jest.fn() as jest.Mock<
            void,
            IStepperStep<ITransactionDialogStepMeta>[][]
        >;
        const stepper = generateStepperResult<
            ITransactionDialogStepMeta,
            string
        >({ updateActiveStep, updateSteps });
        render(createTestComponent({ stepper, intent: { id: 'intent' } }));

        const { action: confirmStepAction } =
            updateSteps.mock.calls[0][0][2].meta;
        act(() => confirmStepAction?.({ onError: jest.fn() }));

        expect(managerClearSpy).toHaveBeenCalledWith('intent');
        expect(updateActiveStep).toHaveBeenCalledWith(
            TransactionDialogStep.PREPARE,
        );
    });

    describe('confirm step timeout', () => {
        const logMessageSpy = jest.spyOn(monitoringUtils, 'logMessage');

        beforeEach(() => {
            jest.useFakeTimers();
            logMessageSpy.mockImplementation(() => undefined);
            usePendingTransactionMock.mockReturnValue({
                status: PendingTransactionStatus.SUBMITTED,
                hash: '0x1',
                submittedAt: Date.now(),
            });
            useWaitForTransactionReceiptSpy.mockReturnValue({
                status: 'pending',
                fetchStatus: 'fetching',
            } as unknown as Wagmi.UseWaitForTransactionReceiptReturnType);
        });

        afterEach(() => {
            jest.clearAllTimers();
            jest.useRealTimers();
            logMessageSpy.mockReset();
        });

        const getLastConfirmStep = (
            updateSteps: jest.Mock<
                void,
                IStepperStep<ITransactionDialogStepMeta>[][]
            >,
        ) =>
            updateSteps.mock.lastCall?.[0].find(
                (step) => step.id === (TransactionDialogStep.CONFIRM as string),
            );

        it('flips the confirm step to a warning with guidance once the transaction stays unconfirmed past the timeout', () => {
            const updateSteps = jest.fn() as jest.Mock<
                void,
                IStepperStep<ITransactionDialogStepMeta>[][]
            >;
            const stepper = generateStepperResult<
                ITransactionDialogStepMeta,
                string
            >({ updateSteps });
            render(createTestComponent({ stepper }));

            expect(getLastConfirmStep(updateSteps)?.meta.state).toEqual(
                'pending',
            );
            expect(
                screen.queryByText(/confirmWarning.title/),
            ).not.toBeInTheDocument();

            act(() => jest.advanceTimersByTime(90_000));

            const confirmStep = getLastConfirmStep(updateSteps);
            expect(confirmStep?.meta.state).toEqual('warning');
            expect(confirmStep?.meta.warningLabel).toMatch(
                /CONFIRM.warningLabel/,
            );
            expect(
                screen.getByText(/confirmWarning.title/),
            ).toBeInTheDocument();
            expect(logMessageSpy).toHaveBeenCalled();
        });

        it('warns immediately when resuming a transaction already unconfirmed for longer than the timeout', () => {
            usePendingTransactionMock.mockReturnValue({
                status: PendingTransactionStatus.SUBMITTED,
                hash: '0x1',
                submittedAt: Date.now() - 400_000,
            });
            const updateSteps = jest.fn() as jest.Mock<
                void,
                IStepperStep<ITransactionDialogStepMeta>[][]
            >;
            const stepper = generateStepperResult<
                ITransactionDialogStepMeta,
                string
            >({ updateSteps });
            render(createTestComponent({ stepper }));

            act(() => jest.advanceTimersByTime(0));

            expect(getLastConfirmStep(updateSteps)?.meta.state).toEqual(
                'warning',
            );
        });

        it('gates the confirm step retry behind the retry confirmation dialog while warning', () => {
            const open = jest.fn();
            const useDialogContextSpy = jest
                .spyOn(DialogProviderModule, 'useDialogContext')
                .mockReturnValue(generateDialogContext({ open }));
            const updateSteps = jest.fn() as jest.Mock<
                void,
                IStepperStep<ITransactionDialogStepMeta>[][]
            >;
            const stepper = generateStepperResult<
                ITransactionDialogStepMeta,
                string
            >({ updateSteps });
            render(createTestComponent({ stepper }));
            act(() => jest.advanceTimersByTime(90_000));

            const { action: confirmStepAction } =
                getLastConfirmStep(updateSteps)?.meta ?? {};
            act(() => confirmStepAction?.({ onError: jest.fn() }));

            expect(open).toHaveBeenCalledWith(
                ApplicationDialogId.RETRY_TRANSACTION_WARNING,
                expect.objectContaining({
                    stack: true,
                    params: { onRetry: expect.any(Function) },
                }),
            );
            useDialogContextSpy.mockRestore();
        });
    });
});

describe('<TransactionDialog /> onIndexed callback', () => {
    const useTransactionStatusSpy = jest.spyOn(
        transactionService,
        'useTransactionStatus',
    );
    const useSendTransactionSpy = jest.spyOn(Wagmi, 'useSendTransaction');
    const useMutationSpy = jest.spyOn(ReactQuery, 'useMutation');
    const useWaitForTransactionReceiptSpy = jest.spyOn(
        Wagmi,
        'useWaitForTransactionReceipt',
    );
    const useConnectionSpy = jest.spyOn(Wagmi, 'useConnection');
    const useSwitchChainSpy = jest.spyOn(Wagmi, 'useSwitchChain');
    const usePendingTransactionMock = jest.mocked(usePendingTransaction);
    const managerSendSpy = jest.spyOn(pendingTransactionManager, 'send');
    const managerClearSpy = jest.spyOn(pendingTransactionManager, 'clear');
    const managerGetSpy = jest.spyOn(pendingTransactionManager, 'get');
    const trackAnalyticsSpy = jest.spyOn(plausibleAnalyticsUtils, 'track');

    beforeEach(() => {
        useSendTransactionSpy.mockReturnValue(
            {} as Wagmi.UseSendTransactionReturnType,
        );
        useMutationSpy.mockReturnValue({} as ReactQuery.UseMutationResult);
        useConnectionSpy.mockReturnValue(
            {} as unknown as Wagmi.UseConnectionReturnType,
        );
        useWaitForTransactionReceiptSpy.mockReturnValue({
            status: 'success',
        } as unknown as Wagmi.UseWaitForTransactionReceiptReturnType);
        useSwitchChainSpy.mockReturnValue({
            mutate: jest.fn(),
        } as unknown as Wagmi.UseSwitchChainReturnType);
        usePendingTransactionMock.mockReturnValue(undefined);
        managerSendSpy.mockImplementation(() => undefined);
        managerClearSpy.mockImplementation(() => undefined);
        managerGetSpy.mockReturnValue(undefined);
        // Default: not yet indexed
        useTransactionStatusSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: { isProcessed: false } }),
        );
        trackAnalyticsSpy.mockImplementation(() => undefined);
    });

    afterEach(() => {
        useSendTransactionSpy.mockReset();
        useMutationSpy.mockReset();
        useConnectionSpy.mockReset();
        useWaitForTransactionReceiptSpy.mockReset();
        useSwitchChainSpy.mockReset();
        usePendingTransactionMock.mockReset();
        managerSendSpy.mockReset();
        managerClearSpy.mockReset();
        managerGetSpy.mockReset();
        useTransactionStatusSpy.mockReset();
        trackAnalyticsSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<ITransactionDialogProps>) => {
        const completeProps: ITransactionDialogProps = {
            title: 'title',
            description: 'description',
            intent: { id: 'intent' },
            submitLabel: 'submit',
            stepper: generateStepperResult<ITransactionDialogStepMeta, string>({
                activeStep: TransactionDialogStep.INDEXING,
            }),
            prepareTransaction: jest.fn(),
            successLink: { label: '', href: '' },
            transactionType: TransactionType.PROPOSAL_CREATE,
            ...props,
        };

        return (
            <GukModulesProvider>
                <DialogProvider>
                    <Dialog.Root open={true}>
                        <TransactionDialog {...completeProps} />
                    </Dialog.Root>
                </DialogProvider>
            </GukModulesProvider>
        );
    };

    it('calls onIndexed exactly once when the transaction is indexed, with the proposal slug', () => {
        const onIndexed = jest.fn();

        // First render: the transaction is not indexed yet.
        useTransactionStatusSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: { isProcessed: false } }),
        );

        const propsWithCallback: Partial<ITransactionDialogProps> = {
            analytics: {
                flow: 'create_proposal',
                transactionTypeEvent: 'governance_proposal_create',
            },
            onIndexed,
        };

        const { rerender } = render(createTestComponent(propsWithCallback));

        // The callback waits until indexing completes.
        expect(onIndexed).not.toHaveBeenCalled();

        // Transition to indexed with a proposal slug.
        useTransactionStatusSpy.mockReturnValue(
            generateReactQueryResultSuccess({
                data: { isProcessed: true, slug: 'abc' },
            }),
        );

        act(() => {
            rerender(createTestComponent(propsWithCallback));
        });

        expect(onIndexed).toHaveBeenCalledTimes(1);
        expect(onIndexed).toHaveBeenCalledWith({ slug: 'abc' });
        expect(trackAnalyticsSpy).toHaveBeenCalledWith('transaction_end', {
            flow: 'create_proposal',
            transactionTypeEvent: 'governance_proposal_create',
            chainId: networkDefinitions[Network.ETHEREUM_MAINNET].id,
            network: Network.ETHEREUM_MAINNET,
            status: 'indexed',
        });

        // React Query polling can replace the status object, and consumers can pass
        // inline callbacks. Neither should trigger the callback a second time.
        const onIndexedNext = jest.fn();
        const nextProps: Partial<ITransactionDialogProps> = {
            onIndexed: onIndexedNext,
        };
        useTransactionStatusSpy.mockReturnValue(
            generateReactQueryResultSuccess({
                data: { isProcessed: true, slug: 'abc' },
            }),
        );

        act(() => {
            rerender(createTestComponent(nextProps));
        });

        expect(onIndexed).toHaveBeenCalledTimes(1);
        expect(onIndexedNext).not.toHaveBeenCalled();
    });

    it('does not throw when indexing completes and onIndexed is omitted', () => {
        // Start before indexing completes.
        useTransactionStatusSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: { isProcessed: false } }),
        );

        const { rerender } = render(createTestComponent({}));

        // Complete indexing without a callback; the optional callback must be a no-op.
        useTransactionStatusSpy.mockReturnValue(
            generateReactQueryResultSuccess({
                data: { isProcessed: true, slug: 'xyz' },
            }),
        );

        act(() => {
            rerender(createTestComponent({}));
        });

        // Dialog survives the indexed signal with no callback attached.
        expect(screen.getByTestId('footer-mock')).toBeInTheDocument();
        expect(trackAnalyticsSpy).not.toHaveBeenCalled();
    });
});
