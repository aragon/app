import { DialogAlert, GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as DialogProvider from '@/shared/components/dialogProvider';
import { generateDialogContext } from '@/shared/testUtils';
import { RetryTransactionAlertDialog } from './retryTransactionAlertDialog';
import type { IRetryTransactionAlertDialogParams } from './retryTransactionAlertDialog.api';

describe('<RetryTransactionAlertDialog /> component', () => {
    const useDialogContextSpy = jest.spyOn(DialogProvider, 'useDialogContext');

    beforeEach(() => {
        useDialogContextSpy.mockReturnValue(generateDialogContext());
    });

    afterEach(() => {
        useDialogContextSpy.mockReset();
    });

    const createTestComponent = (
        params?: Partial<IRetryTransactionAlertDialogParams>,
    ) => {
        const completeParams: IRetryTransactionAlertDialogParams = {
            onRetry: jest.fn(),
            ...params,
        };

        return (
            <GukModulesProvider>
                <DialogAlert.Root open={true} variant="warning">
                    <RetryTransactionAlertDialog
                        location={{ id: 'warning', params: completeParams }}
                    />
                </DialogAlert.Root>
            </GukModulesProvider>
        );
    };

    it('renders the warning title and both description paragraphs', () => {
        render(createTestComponent());
        expect(
            screen.getByText(
                'app.application.retryTransactionAlertDialog.title',
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'app.application.retryTransactionAlertDialog.description.1',
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'app.application.retryTransactionAlertDialog.description.2',
            ),
        ).toBeInTheDocument();
    });

    it('closes and retries when the retry action is clicked', async () => {
        const close = jest.fn();
        const onRetry = jest.fn();
        useDialogContextSpy.mockReturnValue(generateDialogContext({ close }));
        render(createTestComponent({ onRetry }));

        await userEvent.click(
            screen.getByRole('button', {
                name: 'app.application.retryTransactionAlertDialog.action.retry',
            }),
        );

        expect(close).toHaveBeenCalledWith('warning');
        expect(onRetry).toHaveBeenCalled();
    });

    it('only dismisses the warning on "Go back" click', async () => {
        const close = jest.fn();
        const onRetry = jest.fn();
        useDialogContextSpy.mockReturnValue(generateDialogContext({ close }));
        render(createTestComponent({ onRetry }));

        await userEvent.click(
            screen.getByRole('button', {
                name: 'app.application.retryTransactionAlertDialog.action.back',
            }),
        );

        expect(close).toHaveBeenCalledWith('warning');
        expect(onRetry).not.toHaveBeenCalled();
    });
});
