import { generateDialogContext } from '@/shared/testUtils';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as useDialogContext from '../dialogProvider';
import { DialogRoot, type IDialogRootProps } from './dialogRoot';

describe('<DialogRoot /> component', () => {
    const useDialogContextSpy = jest.spyOn(useDialogContext, 'useDialogContext');

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
        const location = undefined;
        useDialogContextSpy.mockReturnValue(generateDialogContext({ location }));
        const { container } = render(createTestComponent());
        expect(container).toBeEmptyDOMElement();
    });

    it('renders the component linked to the current active dialog', () => {
        const dialogId = 'connect-wallet';
        const dialogContent = 'connect-wallet-content';
        const dialogs = { [dialogId]: { Component: () => dialogContent } };
        const location = { id: dialogId };
        useDialogContextSpy.mockReturnValue(generateDialogContext({ location }));
        render(createTestComponent({ dialogs }));
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText(dialogContent)).toBeInTheDocument();
    });

    it('renders the specified dialog title and description as hidden', () => {
        const dialogId = 'connect-wallet';
        const title = 'test-title';
        const description = 'test-description';
        const dialogs = { [dialogId]: { Component: () => 'test', title, description } };
        const location = { id: dialogId };
        useDialogContextSpy.mockReturnValue(generateDialogContext({ location }));
        render(createTestComponent({ dialogs }));
        expect(screen.getByText(title)).toBeInTheDocument();
        expect(screen.getByText(description)).toBeInTheDocument();
    });

    it('calls the close function set on the dialog-provider on dialog close', async () => {
        const dialogId = 'test';
        const dialogs = { [dialogId]: { Component: () => null } };
        const location = { id: dialogId };
        const close = jest.fn();
        useDialogContextSpy.mockReturnValue(generateDialogContext({ location, close }));
        render(createTestComponent({ dialogs }));
        await userEvent.keyboard('{Escape}');
        expect(close).toHaveBeenCalled();
    });
});
