import { DialogAlert, GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as DialogProvider from '@/shared/components/dialogProvider';
import { generateDialogContext } from '@/shared/testUtils';
import { DuplicateProposalAlertDialog } from './duplicateProposalAlertDialog';
import type { IDuplicateProposalAlertDialogParams } from './duplicateProposalAlertDialog.api';

describe('<DuplicateProposalAlertDialog /> component', () => {
    const useDialogContextSpy = jest.spyOn(DialogProvider, 'useDialogContext');

    beforeEach(() => {
        useDialogContextSpy.mockReturnValue(generateDialogContext());
    });

    afterEach(() => {
        useDialogContextSpy.mockReset();
    });

    const createTestComponent = (
        params?: Partial<IDuplicateProposalAlertDialogParams>,
    ) => {
        const completeParams: IDuplicateProposalAlertDialogParams = {
            onProceed: jest.fn(),
            pending: [],
            ...params,
        };

        return (
            <GukModulesProvider>
                <DialogAlert.Root open={true} variant="warning">
                    <DuplicateProposalAlertDialog
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
                'app.governance.duplicateProposalAlertDialog.title',
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'app.governance.duplicateProposalAlertDialog.description.1',
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'app.governance.duplicateProposalAlertDialog.description.2',
            ),
        ).toBeInTheDocument();
    });

    it('closes without proceeding when "Go back" is clicked', async () => {
        const close = jest.fn();
        const onProceed = jest.fn();
        useDialogContextSpy.mockReturnValue(generateDialogContext({ close }));
        render(createTestComponent({ onProceed }));

        await userEvent.click(
            screen.getByRole('button', {
                name: 'app.governance.duplicateProposalAlertDialog.action.back',
            }),
        );

        expect(close).toHaveBeenCalled();
        expect(onProceed).not.toHaveBeenCalled();
    });

    it('closes and proceeds when "Publish anyway" is clicked', async () => {
        const close = jest.fn();
        const onProceed = jest.fn();
        useDialogContextSpy.mockReturnValue(generateDialogContext({ close }));
        render(createTestComponent({ onProceed }));

        await userEvent.click(
            screen.getByRole('button', {
                name: 'app.governance.duplicateProposalAlertDialog.action.publish',
            }),
        );

        expect(close).toHaveBeenCalled();
        expect(onProceed).toHaveBeenCalled();
    });

    it('renders the title, status and transaction link for each in-flight proposal', () => {
        render(
            createTestComponent({
                pending: [
                    {
                        title: 'My proposal',
                        status: 'submitted',
                        transactionUrl: 'https://explorer/tx/0x1',
                    },
                ],
            }),
        );

        expect(screen.getByText('My proposal')).toBeInTheDocument();
        expect(
            screen.getByText(
                'app.governance.duplicateProposalAlertDialog.status.submitted',
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('link', {
                name: 'app.governance.duplicateProposalAlertDialog.link.viewTransaction',
            }),
        ).toHaveAttribute('href', 'https://explorer/tx/0x1');
    });

    it('shows a Return action only when onReturn is provided and resumes on click', async () => {
        const close = jest.fn();
        const onReturn = jest.fn();
        useDialogContextSpy.mockReturnValue(generateDialogContext({ close }));
        render(
            createTestComponent({
                pending: [
                    { title: 'Pending one', status: 'pending', onReturn },
                ],
            }),
        );

        await userEvent.click(
            screen.getByRole('button', {
                name: 'app.governance.duplicateProposalAlertDialog.action.return',
            }),
        );

        expect(close).toHaveBeenCalled();
        expect(onReturn).toHaveBeenCalled();
    });

    it('omits the Return action when onReturn is absent', () => {
        render(
            createTestComponent({
                pending: [{ title: 'No resume', status: 'submitted' }],
            }),
        );

        expect(
            screen.queryByRole('button', {
                name: 'app.governance.duplicateProposalAlertDialog.action.return',
            }),
        ).not.toBeInTheDocument();
    });
});
