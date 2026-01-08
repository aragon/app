import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { generateDialogContext } from '@/shared/testUtils';
import { testLogger } from '@/test/utils';
import * as useDialogContext from '../dialogProvider';
import { DialogRoot, type IDialogRootProps } from './dialogRoot';

describe('<DialogRoot /> component', () => {
    const useDialogContextSpy = jest.spyOn(
        useDialogContext,
        'useDialogContext',
    );

    beforeEach(() => {
        useDialogContextSpy.mockReturnValue(generateDialogContext());
    });

    afterEach(() => {
        useDialogContextSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IDialogRootProps>) => {
        const completeProps: IDialogRootProps = {
            dialogs: {},
            ...props,
        };

        return <DialogRoot {...completeProps} />;
    };

    it('renders empty container when no dialog is active', () => {
        const locations = undefined;
        useDialogContextSpy.mockReturnValue(
            generateDialogContext({ locations }),
        );
        const { container } = render(createTestComponent());
        expect(container).toBeEmptyDOMElement();
    });

    it('renders the component linked to the current active dialog', () => {
        const dialogId = 'connect-wallet';
        const dialogContent = 'connect-wallet-content';
        const dialogs = { [dialogId]: { Component: () => dialogContent } };
        const locations = [{ id: dialogId }];
        useDialogContextSpy.mockReturnValue(
            generateDialogContext({ locations }),
        );
        render(createTestComponent({ dialogs }));
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText(dialogContent)).toBeInTheDocument();
    });

    it('renders the specified dialog title and description as hidden', () => {
        const dialogId = 'connect-wallet';
        const hiddenTitle = 'test-title';
        const hiddenDescription = 'test-description';
        const dialogs = {
            [dialogId]: {
                Component: () => 'test',
                hiddenTitle,
                hiddenDescription,
            },
        };
        const locations = [{ id: dialogId }];
        useDialogContextSpy.mockReturnValue(
            generateDialogContext({ locations }),
        );
        render(createTestComponent({ dialogs }));
        expect(screen.getByText(hiddenTitle)).toBeInTheDocument();
        expect(screen.getByText(hiddenDescription)).toBeInTheDocument();
    });

    it('calls the close function set on the dialog-provider on dialog close', async () => {
        const dialogId = 'test';
        const dialogs = { [dialogId]: { Component: () => null } };
        const locations = [{ id: dialogId }];
        const close = jest.fn();
        useDialogContextSpy.mockReturnValue(
            generateDialogContext({ locations, close }),
        );
        render(createTestComponent({ dialogs }));
        await userEvent.keyboard('{Escape}');
        expect(close).toHaveBeenCalled();
    });

    it('renders an alert dialog when active dialog has the variant property set', () => {
        testLogger.suppressErrors(); // Suppress missing title & description errors
        const dialogId = 'test';
        const variant = 'critical' as const;
        const dialogs = { [dialogId]: { Component: () => 'test', variant } };
        const locations = [{ id: dialogId }];
        useDialogContextSpy.mockReturnValue(
            generateDialogContext({ locations }),
        );
        render(createTestComponent({ dialogs }));
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });
});
