import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as useDialogContext from '../dialogProvider';
import { DialogRoot, type IDialogRootProps } from './dialogRoot';

describe('<DialogRoot /> component', () => {
    const useDialogContextSpy = jest.spyOn(useDialogContext, 'useDialogContext');

    beforeEach(() => {
        useDialogContextSpy.mockReturnValue({ open: jest.fn(), close: jest.fn() });
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
        useDialogContextSpy.mockReturnValue({ location: undefined, close: jest.fn(), open: jest.fn() });
        const { container } = render(createTestComponent());
        expect(container).toBeEmptyDOMElement();
    });

    it('renders the component linked to the current active dialog', () => {
        const dialogId = 'connect-wallet';
        const dialogContent = 'content-for-dialog';
        const isAlert = false;
        const dialogs = {
            [dialogId]: {
                Component: () => dialogContent,
                isAlert,
            },
        };
        const location = { id: dialogId };
        useDialogContextSpy.mockReturnValue({ location, open: jest.fn(), close: jest.fn() });
        render(createTestComponent({ dialogs }));
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText(dialogContent)).toBeInTheDocument();
    });

    it('renders the specified dialog title and description as hidden', () => {
        const dialogId = 'connect-wallet';
        const title = 'test-title';
        const description = 'test-description';
        const isAlert = false;
        const dialogs = { [dialogId]: { Component: () => 'test', title, description, isAlert } };
        const location = { id: dialogId };
        useDialogContextSpy.mockReturnValue({ location, open: jest.fn(), close: jest.fn() });
        render(createTestComponent({ dialogs }));
        expect(screen.getByText(title)).toBeInTheDocument();
        expect(screen.getByText(description)).toBeInTheDocument();
    });

    it('renders DialogAlert.Root when isAlert is true', () => {
        const dialogId = 'alert-dialog';
        const dialogContent = 'alert-dialog-content';
        const isAlert = true;
        const dialogs = {
            [dialogId]: {
                Component: () => dialogContent,
                isAlert,
                title: 'Alert Title',
                description: 'Alert Description',
            },
        };
        const location = { id: dialogId };
        useDialogContextSpy.mockReturnValue({ location, open: jest.fn(), close: jest.fn() });
        render(createTestComponent({ dialogs }));

        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
        expect(screen.getByText('alert-dialog-content')).toBeInTheDocument();
        expect(screen.getByText('Alert Title')).toBeInTheDocument();
        expect(screen.getByText('Alert Description')).toBeInTheDocument();
    });

    it('calls the close function set on the dialog-provider on dialog close', async () => {
        const dialogId = 'test';
        const dialogs = { [dialogId]: { Component: () => null, isAlert: false } };
        const location = { id: dialogId };
        const close = jest.fn();
        useDialogContextSpy.mockReturnValue({ location, open: jest.fn(), close });
        render(createTestComponent({ dialogs }));
        await userEvent.keyboard('{Escape}');
        expect(close).toHaveBeenCalled();
    });
});
