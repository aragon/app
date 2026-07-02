import { Dialog, GukModulesProvider, IconType } from '@aragon/gov-ui-kit';
import * as ReactQuery from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import type { WaitForTransactionReceiptErrorType } from 'viem';
import * as Wagmi from 'wagmi';
import { Network } from '@/shared/api/daoService';
import { TransactionType } from '@/shared/api/transactionService';
import { DialogProvider } from '@/shared/components/dialogProvider/dialogProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { usePendingTransaction } from '@/shared/hooks/usePendingTransaction';
import {
    generateReactQueryResultError,
    generateStepperResult,
} from '@/shared/testUtils';
import {
    PendingTransactionStatus,
    pendingTransactionManager,
} from '@/shared/utils/pendingTransactionManager';
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
    const managerIsInterruptedSpy = jest.spyOn(
        pendingTransactionManager,
        'isInterrupted',
    );

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
        managerIsInterruptedSpy.mockReturnValue(false);
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
        managerIsInterruptedSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<ITransactionDialogProps>) => {
        const completeProps: ITransactionDialogProps = {
            title: 'title',
            description: 'description',
            intentId: 'intent',
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
        render(createTestComponent({ stepper, network, intentId: 'intent' }));
        const { action: approveStepAction } =
            updateSteps.mock.calls[0][0][1].meta;
        act(() => approveStepAction?.({ onError: jest.fn() }));
        expect(managerSendSpy).toHaveBeenCalledWith(
            'intent',
            expect.objectContaining(transaction),
            undefined,
        );
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
        render(createTestComponent({ stepper, network, intentId: undefined }));
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
        render(createTestComponent({ stepper, network, intentId: 'intent' }));
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
        render(createTestComponent({ stepper, intentId: 'intent' }));
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
        render(createTestComponent({ stepper, intentId: 'intent' }));
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
        render(createTestComponent({ stepper, intentId: 'intent' }));
        expect(updateActiveStep).toHaveBeenCalledWith(
            TransactionDialogStep.CONFIRM,
        );
    });

    it('resumes to the approve step for a live pending request', () => {
        managerGetSpy.mockReturnValue({
            status: PendingTransactionStatus.PENDING,
        });
        managerIsInterruptedSpy.mockReturnValue(false);
        const updateActiveStep = jest.fn();
        const stepper = generateStepperResult<
            ITransactionDialogStepMeta,
            string
        >({ updateActiveStep });
        render(createTestComponent({ stepper, intentId: 'intent' }));
        expect(updateActiveStep).toHaveBeenCalledWith(
            TransactionDialogStep.APPROVE,
        );
    });

    it('clears an interrupted (reloaded) pending record and starts fresh', () => {
        managerGetSpy.mockReturnValue({
            status: PendingTransactionStatus.PENDING,
        });
        managerIsInterruptedSpy.mockReturnValue(true);
        const updateActiveStep = jest.fn();
        const stepper = generateStepperResult<
            ITransactionDialogStepMeta,
            string
        >({ updateActiveStep });
        render(createTestComponent({ stepper, intentId: 'intent' }));
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
    });
});
