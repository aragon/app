import { IconType } from '@aragon/ods';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as useDialogContext from '../dialogProvider';
import { ITransactionDialogStep, TransactionDialogStep } from './transactionDialog.api';
import { ITransactionDialogFooterProps, TransactionDialogFooter } from './transactionDialogFooter';

describe('<TransactionDialogFooter /> component', () => {
    const useDialogContextSpy = jest.spyOn(useDialogContext, 'useDialogContext');

    beforeEach(() => {
        useDialogContextSpy.mockReturnValue({ open: jest.fn(), close: jest.fn() });
    });

    const createTestComponent = (props?: Partial<ITransactionDialogFooterProps>) => {
        const completeProps: ITransactionDialogFooterProps = {
            submitLabel: 'label',
            onError: jest.fn(),
            ...props,
        };

        return <TransactionDialogFooter {...completeProps} />;
    };

    it('renders a button with the specified label and a cancel button', () => {
        const submitLabel = 'next-step';
        render(createTestComponent({ submitLabel }));
        expect(screen.getByRole('button', { name: submitLabel })).toBeInTheDocument();
        const cancelButton = screen.getByRole('button', { name: /transactionDialog.footer.cancel/ });
        expect(cancelButton).toBeInTheDocument();
        expect(cancelButton).not.toBeDisabled();
    });

    it('closes the dialog on cancel button click', async () => {
        const close = jest.fn();
        useDialogContextSpy.mockReturnValue({ open: jest.fn(), close });
        render(createTestComponent());
        await userEvent.click(screen.getByRole('button', { name: /transactionDialog.footer.cancel/ }));
        expect(close).toHaveBeenCalled();
    });

    it('disables the cancel button when the active step is confirm and its state is pending', () => {
        const activeStep = {
            id: TransactionDialogStep.CONFIRM,
            meta: { state: 'pending' },
        } as ITransactionDialogStep;
        render(createTestComponent({ activeStep }));
        expect(screen.getByRole('button', { name: /transactionDialog.footer.cancel/ })).toBeDisabled();
    });

    it('disables the cancel button when the active step is confirm and its state is success', () => {
        const activeStep = {
            id: TransactionDialogStep.CONFIRM,
            meta: { state: 'success' },
        } as ITransactionDialogStep;
        render(createTestComponent({ activeStep }));
        expect(screen.getByRole('button', { name: /transactionDialog.footer.cancel/ })).toBeDisabled();
    });

    it.each([{ state: 'idle' }, { state: 'pending' }, { state: 'error' }])(
        'renders the custom approve label when active step is approve and state is $state',
        ({ state }) => {
            const activeStep = {
                id: TransactionDialogStep.APPROVE,
                meta: { state },
            } as ITransactionDialogStep;
            render(createTestComponent({ activeStep }));
            expect(
                screen.getByRole('button', { name: new RegExp(`transactionDialog.footer.approve.${state}`) }),
            ).toBeInTheDocument();
        },
    );

    it('renders default retry label and icon when step is not approve and state is error', () => {
        const activeStep = {
            id: TransactionDialogStep.PREPARE,
            meta: { state: 'error' },
        } as ITransactionDialogStep;
        render(createTestComponent({ activeStep }));
        expect(screen.getByRole('button', { name: /transactionDialog.footer.retry/ })).toBeInTheDocument();
        expect(screen.getByTestId(IconType.RELOAD)).toBeInTheDocument();
    });

    it('renders a loading button when state is pending', () => {
        const activeStep = {
            id: TransactionDialogStep.PREPARE,
            meta: { state: 'pending' },
        } as ITransactionDialogStep;
        render(createTestComponent({ activeStep }));
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('calls the step action and passes the onError callback on submit button click', async () => {
        const approveAction = jest.fn();
        const onError = jest.fn();
        const submitLabel = 'submit';
        const activeStep = {
            id: TransactionDialogStep.PREPARE,
            meta: { state: 'idle', action: approveAction, onError },
        } as unknown as ITransactionDialogStep;
        render(createTestComponent({ submitLabel, activeStep, onError }));
        await userEvent.click(screen.getByRole('button', { name: submitLabel }));
        expect(approveAction).toHaveBeenCalledWith({ onError });
    });
});
