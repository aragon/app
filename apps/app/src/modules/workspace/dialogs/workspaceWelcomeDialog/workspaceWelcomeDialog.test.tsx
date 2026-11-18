import { Dialog, GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as dialogProvider from '@/shared/components/dialogProvider';
import { generateDialogContext } from '@/shared/testUtils';
import { workspaceWelcomeUtils } from '../../utils/workspaceWelcomeUtils';
import {
    type IWorkspaceWelcomeDialogProps,
    WorkspaceWelcomeDialog,
} from './workspaceWelcomeDialog';

describe('<WorkspaceWelcomeDialog /> component', () => {
    afterEach(() => localStorage.clear());
    const useDialogContextSpy = jest.spyOn(dialogProvider, 'useDialogContext');
    const closeMock = jest.fn();

    beforeEach(() => {
        useDialogContextSpy.mockReturnValue(
            generateDialogContext({ close: closeMock }),
        );
    });

    afterEach(() => {
        useDialogContextSpy.mockReset();
        closeMock.mockReset();
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

    it('greets the user with the copy of the welcome dialog', () => {
        render(createTestComponent());

        expect(
            screen.getByText(/workspaceWelcomeDialog\.title$/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                /workspaceWelcomeDialog\.feature\.waiting\.title$/,
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/workspaceWelcomeDialog\.feature\.track\.title$/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/workspaceWelcomeDialog\.note$/),
        ).toBeInTheDocument();
    });

    it('closes the dialog and records the first run when the user opens the workspace', async () => {
        workspaceWelcomeUtils.markPendingWelcome();

        render(createTestComponent());

        await userEvent.click(
            screen.getByRole('button', {
                name: /workspaceWelcomeDialog\.action\.openWorkspace/,
            }),
        );

        expect(closeMock).toHaveBeenCalledWith('WORKSPACE_WELCOME');
        expect(workspaceWelcomeUtils.isWelcomePending()).toBe(false);
    });
});
