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

    it('renders the warning title and description', () => {
        render(createTestComponent());
        expect(
            screen.getByText(
                'app.governance.duplicateProposalAlertDialog.title',
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'app.governance.duplicateProposalAlertDialog.description',
            ),
        ).toBeInTheDocument();
    });

    it('closes without proceeding when the safe action is clicked', async () => {
        const close = jest.fn();
        const onProceed = jest.fn();
        useDialogContextSpy.mockReturnValue(generateDialogContext({ close }));
        render(createTestComponent({ onProceed }));

        await userEvent.click(
            screen.getByRole('button', {
                name: 'app.governance.duplicateProposalAlertDialog.action.wait',
            }),
        );

        expect(close).toHaveBeenCalled();
        expect(onProceed).not.toHaveBeenCalled();
    });

    it('closes and proceeds when the user chooses to create anyway', async () => {
        const close = jest.fn();
        const onProceed = jest.fn();
        useDialogContextSpy.mockReturnValue(generateDialogContext({ close }));
        render(createTestComponent({ onProceed }));

        await userEvent.click(
            screen.getByRole('button', {
                name: 'app.governance.duplicateProposalAlertDialog.action.proceed',
            }),
        );

        expect(close).toHaveBeenCalled();
        expect(onProceed).toHaveBeenCalled();
    });
});
