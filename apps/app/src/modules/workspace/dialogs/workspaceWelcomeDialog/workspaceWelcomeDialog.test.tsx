import { Dialog, GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as dialogProvider from '@/shared/components/dialogProvider';
import { generateDialogContext } from '@/shared/testUtils';
import {
    type IWorkspaceWelcomeDialogProps,
    WorkspaceWelcomeDialog,
} from './workspaceWelcomeDialog';

describe('<WorkspaceWelcomeDialog /> component', () => {
    const closeSpy = jest.fn();
    const useDialogContextSpy = jest.spyOn(dialogProvider, 'useDialogContext');

    beforeEach(() => {
        useDialogContextSpy.mockReturnValue(
            generateDialogContext({ close: closeSpy }),
        );
    });

    afterEach(() => {
        useDialogContextSpy.mockReset();
        closeSpy.mockClear();
    });

    const createTestComponent = (
        props?: Partial<IWorkspaceWelcomeDialogProps>,
    ) => {
        const completeProps: IWorkspaceWelcomeDialogProps = {
            location: { id: 'WORKSPACE_WELCOME' },
            ...props,
        };

        return (
            <GukModulesProvider>
                <Dialog.Root open={true}>
                    <WorkspaceWelcomeDialog {...completeProps} />
                </Dialog.Root>
            </GukModulesProvider>
        );
    };

    it('renders the title, both items and the note', () => {
        render(createTestComponent());

        expect(
            screen.getByText('app.workspace.workspaceWelcomeDialog.title'),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'app.workspace.workspaceWelcomeDialog.items.pending.title',
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'app.workspace.workspaceWelcomeDialog.items.pending.description',
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'app.workspace.workspaceWelcomeDialog.items.tracking.title',
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'app.workspace.workspaceWelcomeDialog.items.tracking.description',
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByText('app.workspace.workspaceWelcomeDialog.note'),
        ).toBeInTheDocument();
    });

    it('closes the dialog on "Open workspace"', async () => {
        render(createTestComponent());

        await userEvent.click(
            screen.getByRole('button', {
                name: 'app.workspace.workspaceWelcomeDialog.action',
            }),
        );

        expect(closeSpy).toHaveBeenCalledWith('WORKSPACE_WELCOME');
    });
});
