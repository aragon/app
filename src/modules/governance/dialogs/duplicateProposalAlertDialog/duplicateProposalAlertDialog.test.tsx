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

    it('closes and proceeds when "New transaction" is clicked', async () => {
        const close = jest.fn();
        const onProceed = jest.fn();
        useDialogContextSpy.mockReturnValue(generateDialogContext({ close }));
        render(createTestComponent({ onProceed }));

        await userEvent.click(
            screen.getByRole('button', {
                name: 'app.governance.duplicateProposalAlertDialog.action.new',
            }),
        );

        expect(close).toHaveBeenCalled();
        expect(onProceed).toHaveBeenCalled();
    });

    it('resumes the existing transaction when the resume action is provided and clicked', async () => {
        const close = jest.fn();
        const onResume = jest.fn();
        useDialogContextSpy.mockReturnValue(generateDialogContext({ close }));
        render(createTestComponent({ onResume }));

        await userEvent.click(
            screen.getByRole('button', {
                name: 'app.governance.duplicateProposalAlertDialog.action.resume',
            }),
        );

        expect(close).toHaveBeenCalled();
        expect(onResume).toHaveBeenCalled();
    });

    it('falls back to a "Go back" dismiss when no resume action is available', async () => {
        const close = jest.fn();
        useDialogContextSpy.mockReturnValue(generateDialogContext({ close }));
        render(createTestComponent());

        expect(
            screen.queryByRole('button', {
                name: 'app.governance.duplicateProposalAlertDialog.action.resume',
            }),
        ).not.toBeInTheDocument();

        await userEvent.click(
            screen.getByRole('button', {
                name: 'app.governance.duplicateProposalAlertDialog.action.back',
            }),
        );

        expect(close).toHaveBeenCalled();
    });
});
