import { TransactionType } from '@/shared/api/transactionService/transactionService.api';
import { generateDialogContext } from '@/shared/testUtils';
import { IconType } from '@aragon/gov-ui-kit';
import { act, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { TransactionReceipt } from 'viem';
import * as useDialogContext from '../dialogProvider';
import { type ITransactionDialogStep, TransactionDialogStep } from './transactionDialog.api';
import { type ITransactionDialogFooterProps, TransactionDialogFooter } from './transactionDialogFooter';

const mockRouterPush = jest.fn();
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(() => ({
        push: mockRouterPush,
    })),
}));

describe('<TransactionDialogFooter /> component', () => {
    const useDialogContextSpy = jest.spyOn(useDialogContext, 'useDialogContext');

    beforeEach(() => {
        useDialogContextSpy.mockReturnValue(generateDialogContext());
        mockRouterPush.mockClear();
    });

    const createTestComponent = (props?: Partial<ITransactionDialogFooterProps>) => {
        const completeProps: ITransactionDialogFooterProps = {
            submitLabel: 'label',
            onError: jest.fn(),
            successLink: { href: '', label: '' },
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

    it('closes the dialog on cancel button click and calls the onCancelClick property', async () => {
        const close = jest.fn();
        const onCancelClick = jest.fn();
        useDialogContextSpy.mockReturnValue(generateDialogContext({ close }));
        render(createTestComponent({ onCancelClick }));
        await userEvent.click(screen.getByRole('button', { name: /transactionDialog.footer.cancel/ }));
        expect(close).toHaveBeenCalled();
        expect(onCancelClick).toHaveBeenCalled();
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

    it('does not throw error on submit click when activeStep has no action', async () => {
        const submitLabel = 'submit';
        const activeStep = {
            id: TransactionDialogStep.PREPARE,
            meta: { state: 'idle', action: undefined },
        } as unknown as ITransactionDialogStep;
        render(createTestComponent({ submitLabel, activeStep }));
        await userEvent.click(screen.getByRole('button', { name: submitLabel }));
        expect(screen.getByRole('button', { name: submitLabel })).toBeInTheDocument();
    });

    it('renders the success link label on transaction success', () => {
        const successLink = { label: 'View proposal', href: '/proposal/my-proposal' };
        const activeStep = {
            id: TransactionDialogStep.CONFIRM,
            meta: { state: 'success' },
        } as unknown as ITransactionDialogStep;
        render(createTestComponent({ successLink, activeStep }));
        const link = screen.getByRole('link', { name: successLink.label });
        expect(link).toBeInTheDocument();
        expect(link.getAttribute('href')).toEqual(successLink.href);
    });

    it('supports success href to be a function to build the link based on the transaction receipt', () => {
        const txReceipt = { from: '0x123' } as unknown as TransactionReceipt;
        const href = ({ receipt }: { receipt?: TransactionReceipt }) => `/custom-href-${receipt!.from}`;
        const successLink = { label: 'View proposal', href };
        const activeStep = {
            id: TransactionDialogStep.CONFIRM,
            meta: { state: 'success' },
        } as ITransactionDialogStep;
        render(createTestComponent({ txReceipt, successLink, activeStep }));
        expect(screen.getByRole('link').getAttribute('href')).toEqual(href({ receipt: txReceipt }));
    });

    it('supports success href as a function that builds the link based on a slug for proposals', () => {
        const proposalSlug = 'tokenvoting';
        const href = ({ slug }: { slug?: string }) => `/custom-href-${slug!}`;
        const successLink = { label: 'View proposal', href };
        const activeStep = {
            id: TransactionDialogStep.INDEXING,
            meta: { state: 'success' },
        } as ITransactionDialogStep;

        render(
            createTestComponent({
                proposalSlug,
                successLink,
                activeStep,
                transactionType: TransactionType.PROPOSAL_CREATE,
            }),
        );

        expect(screen.getByRole('link').getAttribute('href')).toEqual(href({ slug: proposalSlug }));
    });

    it('closes the dialog on success link click', async () => {
        const href = () => `/custom-link`;
        const successLink = { label: 'View proposal', href };
        const close = jest.fn();
        useDialogContextSpy.mockReturnValue(generateDialogContext({ close }));
        const activeStep = {
            id: TransactionDialogStep.CONFIRM,
            meta: { state: 'success' },
        } as unknown as ITransactionDialogStep;
        render(createTestComponent({ successLink, activeStep }));
        await userEvent.click(screen.getByText(successLink.label));
        expect(close).toHaveBeenCalled();
    });

    describe('shouldProceedAnywayFeature', () => {
        // Fake timers outside of this block causes issues with other tests
        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('changes the cancel button text to "Proceed anyway" after 8 seconds in the indexing step', () => {
            const activeStep = {
                id: TransactionDialogStep.INDEXING,
                meta: { state: 'pending' },
            } as ITransactionDialogStep;

            render(createTestComponent({ activeStep }));

            // Cancel button is the default button
            expect(screen.getByRole('button', { name: /transactionDialog.footer.cancel/ })).toBeInTheDocument();

            // simulate 8 seconds passing
            act(() => {
                jest.advanceTimersByTime(8000);
            });

            // Cancel button should now be Proceed anyway
            expect(screen.getByRole('button', { name: /transactionDialog.footer.proceedAnyway/ })).toBeInTheDocument();
        });

        it('navigates to the proposals page when type is PROPOSAL_CREATE', () => {
            const close = jest.fn();
            const daoId = 'test-dao-proposal';

            useDialogContextSpy.mockReturnValue(generateDialogContext({ close }));

            const activeStep = {
                id: TransactionDialogStep.INDEXING,
                meta: { state: 'pending' },
            } as ITransactionDialogStep;

            render(
                createTestComponent({
                    activeStep,
                    transactionType: TransactionType.PROPOSAL_CREATE,
                    daoId,
                }),
            );

            act(() => {
                jest.advanceTimersByTime(8000);
            });

            const proceedButton = screen.getByRole('button', { name: /transactionDialog.footer.proceedAnyway/ });

            act(() => {
                proceedButton.click();
            });

            expect(close).toHaveBeenCalled();
            expect(mockRouterPush).toHaveBeenCalledWith(`/dao/${daoId}/proposals`);
        });

        it('navigates to the explore page when type is DAO_CREATE', () => {
            const close = jest.fn();
            const daoId = 'test-dao-proposal';

            useDialogContextSpy.mockReturnValue(generateDialogContext({ close }));

            const activeStep = {
                id: TransactionDialogStep.INDEXING,
                meta: { state: 'pending' },
            } as ITransactionDialogStep;

            render(
                createTestComponent({
                    activeStep,
                    transactionType: TransactionType.DAO_CREATE,
                    daoId,
                }),
            );

            act(() => {
                jest.advanceTimersByTime(8000);
            });

            const proceedButton = screen.getByRole('button', { name: /transactionDialog.footer.proceedAnyway/ });

            act(() => {
                proceedButton.click();
            });

            expect(close).toHaveBeenCalled();
            expect(mockRouterPush).toHaveBeenCalledWith(`/`);
        });
    });
});
