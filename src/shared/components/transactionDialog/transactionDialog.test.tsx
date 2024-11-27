import { generateStepperResult } from '@/shared/testUtils';
import type { IStepperStep } from '@/shared/utils/stepperUtils';
import { GukModulesProvider, IconType } from '@aragon/gov-ui-kit';
import * as ReactQuery from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import { polygon } from 'viem/chains';
import * as Wagmi from 'wagmi';
import { TransactionDialog } from './transactionDialog';
import {
    TransactionDialogStep,
    type ITransactionDialogProps,
    type ITransactionDialogStepMeta,
} from './transactionDialog.api';

jest.mock('./transactionDialogFooter', () => ({ TransactionDialogFooter: () => <div data-testid="footer-mock" /> }));

jest.mock('@tanstack/react-query', () => ({ __esModule: true, ...jest.requireActual('@tanstack/react-query') }));

describe('<TransactionDialog /> component', () => {
    const useSendTransactionSpy = jest.spyOn(Wagmi, 'useSendTransaction');
    const useMutationSpy = jest.spyOn(ReactQuery, 'useMutation');
    const useWaitForTransactionReceiptSpy = jest.spyOn(Wagmi, 'useWaitForTransactionReceipt');
    const useChainIdSpy = jest.spyOn(Wagmi, 'useChainId');

    beforeEach(() => {
        useSendTransactionSpy.mockReturnValue({} as Wagmi.UseSendTransactionReturnType);
        useMutationSpy.mockReturnValue({} as ReactQuery.UseMutationResult);
        useWaitForTransactionReceiptSpy.mockReturnValue({} as Wagmi.UseWaitForTransactionReceiptReturnType);
    });

    afterEach(() => {
        useSendTransactionSpy.mockReset();
        useMutationSpy.mockReset();
        useChainIdSpy.mockReset();
        useWaitForTransactionReceiptSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<ITransactionDialogProps>) => {
        const completeProps: ITransactionDialogProps = {
            title: 'title',
            description: 'description',
            submitLabel: 'submit',
            stepper: generateStepperResult(),
            prepareTransaction: jest.fn(),
            successLink: { label: '', href: '' },
            ...props,
        };

        return (
            <GukModulesProvider>
                <TransactionDialog {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders the dialog title, description, footer and children prop', () => {
        const title = 'test-title';
        const description = 'test-description';
        const children = 'children';
        render(createTestComponent({ title, description, children }));
        expect(screen.getByRole('heading', { level: 2, name: title })).toBeInTheDocument();
        expect(screen.getByText(description)).toBeInTheDocument();
        expect(screen.getByText(children)).toBeInTheDocument();
        expect(screen.getByTestId('footer-mock')).toBeInTheDocument();
    });

    it('renders the transaction steps', () => {
        const steps = [
            { id: TransactionDialogStep.APPROVE, order: 0, meta: { label: 'approve' } as ITransactionDialogStepMeta },
            { id: TransactionDialogStep.CONFIRM, order: 1, meta: { label: 'confirm' } as ITransactionDialogStepMeta },
        ] as unknown as Array<IStepperStep<ITransactionDialogStepMeta, string>>;
        const stepper = generateStepperResult({ steps });
        render(createTestComponent({ stepper }));
        expect(screen.getByText(steps[0].meta.label)).toBeInTheDocument();
        expect(screen.getByText(steps[1].meta.label)).toBeInTheDocument();
    });

    it('automatically triggers the step action when its auto property is set to true and state is idle', async () => {
        const stepAction = jest.fn();
        const steps = [
            {
                id: TransactionDialogStep.PREPARE,
                meta: { label: 'prepare', action: stepAction, auto: true, state: 'idle' },
            },
        ] as unknown as Array<IStepperStep<ITransactionDialogStepMeta, string>>;
        const activeStep = TransactionDialogStep.PREPARE;
        const activeStepIndex = 0;
        const stepper = generateStepperResult({ steps, activeStep, activeStepIndex });
        render(createTestComponent({ stepper }));
        await waitFor(() => expect(stepAction).toHaveBeenCalledWith({ onError: expect.any(Function) }));
    });

    it('does not trigger the step action when its auto property is set to false', async () => {
        const stepAction = jest.fn();
        const steps = [
            {
                id: TransactionDialogStep.PREPARE,
                meta: { label: 'prepare', action: stepAction, auto: false, state: 'idle' },
            },
        ] as unknown as Array<IStepperStep<ITransactionDialogStepMeta, string>>;
        const activeStep = TransactionDialogStep.PREPARE;
        const activeStepIndex = 0;
        const stepper = generateStepperResult({ steps, activeStep, activeStepIndex });
        render(createTestComponent({ stepper }));
        await waitFor(() => expect(stepAction).not.toHaveBeenCalled());
    });

    it('correctly set the transaction steps when having custom steps', () => {
        const customSteps = [
            {
                id: 'pin-metadata',
                order: 0,
                meta: { label: 'pin', action: jest.fn(), auto: false, state: 'idle' as const },
            },
            {
                id: 'something',
                order: 1,
                meta: { label: 'something', action: jest.fn(), auto: false, state: 'idle' as const },
            },
        ];
        const expectedSteps = [
            {
                id: TransactionDialogStep.PREPARE,
                order: 2,
                meta: expect.objectContaining({
                    label: expect.stringMatching(/PREPARE.label/),
                    errorLabel: expect.stringMatching(/PREPARE.errorLabel/),
                    auto: true,
                }),
            },
            {
                id: TransactionDialogStep.APPROVE,
                order: 3,
                meta: expect.objectContaining({
                    label: expect.stringMatching(/APPROVE.label/),
                    errorLabel: expect.stringMatching(/APPROVE.errorLabel/),
                    auto: false,
                    addon: { label: expect.stringMatching(/APPROVE.addon/), icon: IconType.BLOCKCHAIN_WALLET },
                }),
            },
            {
                id: TransactionDialogStep.CONFIRM,
                order: 4,
                meta: expect.objectContaining({
                    label: expect.stringMatching(/CONFIRM.label/),
                    errorLabel: expect.stringMatching(/CONFIRM.errorLabel/),
                    auto: false,
                }),
            },
        ];
        const updateSteps = jest.fn();
        const stepper = generateStepperResult<ITransactionDialogStepMeta, string>({ updateSteps });
        render(createTestComponent({ customSteps, stepper }));
        expect(updateSteps).toHaveBeenCalledWith([...customSteps, ...expectedSteps]);
    });

    it('prepare transaction step triggers the prepareTransaction callback', async () => {
        const prepareTransaction = jest.fn();
        const updateSteps = jest.fn();
        useMutationSpy.mockReturnValue({ mutate: prepareTransaction } as unknown as ReactQuery.UseMutationResult);
        const stepper = generateStepperResult<ITransactionDialogStepMeta, string>({ updateSteps });
        render(createTestComponent({ prepareTransaction, stepper }));
        const { action: prepareStepAction } = updateSteps.mock.calls[0][0][0].meta;
        act(() => prepareStepAction());
        await waitFor(() => expect(prepareTransaction).toHaveBeenCalled());
    });

    it('approve transaction step sends the transaction to the user wallet', () => {
        const transaction = { from: '0x', data: '0x' };
        const sendTransaction = jest.fn();
        useMutationSpy.mockReturnValue({ data: transaction } as unknown as ReactQuery.UseMutationResult);
        useSendTransactionSpy.mockReturnValue({ sendTransaction } as unknown as Wagmi.UseSendTransactionReturnType);
        const updateSteps = jest.fn();
        const stepper = generateStepperResult<ITransactionDialogStepMeta, string>({ updateSteps });
        render(createTestComponent({ stepper }));
        const { action: approveStepAction } = updateSteps.mock.calls[0][0][1].meta;
        act(() => approveStepAction());
        expect(sendTransaction).toHaveBeenCalledWith(expect.objectContaining(transaction), expect.anything());
    });

    // it('sets the transaction gas property to null to force sending the transaction even if gas estimation fails', () => {
    //     const sendTransaction = jest.fn();
    //     useMutationSpy.mockReturnValue({ data: { from: '0x', data: '0x' } } as unknown as ReactQuery.UseMutationResult);
    //     useSendTransactionSpy.mockReturnValue({ sendTransaction } as unknown as Wagmi.UseSendTransactionReturnType);
    //     const updateSteps = jest.fn();
    //     const stepper = generateStepperResult<ITransactionDialogStepMeta, string>({ updateSteps });
    //     render(createTestComponent({ stepper }));
    //     const { action: approveStepAction } = updateSteps.mock.calls[0][0][1].meta;
    //     act(() => approveStepAction());
    //     expect(sendTransaction).toHaveBeenCalledWith(expect.objectContaining({"data": "0x", "from": "0x"}), expect.anything());
    // });

    it('does not send the transaction when transaction is not set at approve step', () => {
        const sendTransaction = jest.fn();
        useMutationSpy.mockReturnValue({ data: null } as unknown as ReactQuery.UseMutationResult);
        useSendTransactionSpy.mockReturnValue({ sendTransaction } as unknown as Wagmi.UseSendTransactionReturnType);
        const updateSteps = jest.fn();
        const stepper = generateStepperResult<ITransactionDialogStepMeta, string>({ updateSteps });
        render(createTestComponent({ stepper }));
        const { action: approveStepAction } = updateSteps.mock.calls[0][0][1].meta;
        act(() => approveStepAction());
        expect(sendTransaction).not.toHaveBeenCalled();
    });

    it('confirmation action step retries sending the transaction and updates active step', () => {
        const transaction = { from: '0x', data: '0x' };
        const sendTransaction = jest.fn();
        useMutationSpy.mockReturnValue({ data: transaction } as unknown as ReactQuery.UseMutationResult);
        useSendTransactionSpy.mockReturnValue({ sendTransaction } as unknown as Wagmi.UseSendTransactionReturnType);
        const updateSteps = jest.fn();
        const updateActiveStep = jest.fn();
        const stepper = generateStepperResult<ITransactionDialogStepMeta, string>({ updateSteps, updateActiveStep });
        render(createTestComponent({ stepper }));
        const { action: confirmStepAction } = updateSteps.mock.calls[0][0][2].meta;
        act(() => confirmStepAction());
        expect(sendTransaction).toHaveBeenCalledWith(expect.objectContaining(transaction), expect.anything());
        expect(updateActiveStep).toHaveBeenCalledWith(TransactionDialogStep.APPROVE);
    });

    it('displays the link to the block explorer for the confirmation step on transaction success', () => {
        const transactionHash = '0x1234';
        useChainIdSpy.mockReturnValue(polygon.id);
        useSendTransactionSpy.mockReturnValue({
            data: transactionHash,
        } as unknown as Wagmi.UseSendTransactionReturnType);
        render(createTestComponent());
        const updateSteps = jest.fn();
        const stepper = generateStepperResult<ITransactionDialogStepMeta, string>({ updateSteps });
        render(createTestComponent({ stepper }));
        const confirmStep = updateSteps.mock.calls[0][0][2];
        expect(confirmStep.meta.addon).toEqual({
            label: expect.stringMatching(/CONFIRM.addon/),
            href: `https://polygonscan.com/tx/${transactionHash}`,
        });
    });

    it.each([
        { status: 'pending', fetchStatus: 'idle', expected: 'idle' },
        { status: 'error', fetchStatus: 'idle', expected: 'error' },
        { status: 'pending', fetchStatus: 'fetching', expected: 'pending' },
    ])(
        'correctly parsers the wait-tx query status to $expected when on status $status and fetchStatus $fetchStatus',
        ({ status, fetchStatus, expected }) => {
            useWaitForTransactionReceiptSpy.mockReturnValue({
                status,
                fetchStatus,
            } as Wagmi.UseWaitForTransactionReceiptReturnType);
            const updateSteps = jest.fn();
            const stepper = generateStepperResult<ITransactionDialogStepMeta, string>({ updateSteps });
            render(createTestComponent({ stepper }));
            const confirmStep = updateSteps.mock.calls[0][0][2];
            expect(confirmStep.meta.state).toEqual(expected);
        },
    );
});
