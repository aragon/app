import { DialogAlertRootHiddenElement } from '@/shared/components/dialogRoot';
import { DialogAlert } from '@aragon/ods';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExitDialog, type IExitDialogProps } from './exitDialog';

describe('<ExitDialog /> component', () => {
    const mockAcceptAction = jest.fn();
    const mockDenyAction = jest.fn();

    beforeEach(() => {});

    afterEach(() => {
        jest.clearAllMocks();
    });

    const createTestComponent = (props?: Partial<IExitDialogProps>) => {
        const completeProps = {
            title: 'Exit Confirmation',
            description: 'Are you sure you want to exit?',
            actionButton: { label: 'Yes, exit', onClick: mockAcceptAction },
            cancelButton: { label: 'No, stay', onClick: mockDenyAction },
            ...props,
        };

        return (
            <DialogAlert.Root open={true}>
                <DialogAlertRootHiddenElement labelKey="exitDialog.title" type="title" />
                <DialogAlertRootHiddenElement labelKey="exitDialog.description" type="description" />
                <ExitDialog {...completeProps}></ExitDialog>
            </DialogAlert.Root>
        );
    };

    it('renders the title and description', () => {
        const title = 'Big Exit Confirmation';
        const description = 'Exit this wizard?';
        render(createTestComponent({ title, description }));

        expect(screen.getByText((content) => content.includes(title))).toBeInTheDocument();
        expect(screen.getByText((content) => content.includes(description))).toBeInTheDocument();
    });

    it('renders the accept and deny buttons with correct labels', () => {
        const actionButton = { label: 'Yep', onClick: mockAcceptAction };
        const cancelButton = { label: 'Nope', onClick: mockDenyAction };
        render(createTestComponent({ actionButton, cancelButton }));

        const acceptButton = screen.getByRole('button', { name: actionButton.label });
        const denyButton = screen.getByRole('button', { name: cancelButton.label });

        expect(acceptButton).toBeInTheDocument();
        expect(denyButton).toBeInTheDocument();
    });

    it('calls the accept action when accept button is clicked', async () => {
        const actionButton = { label: 'Yep yep', onClick: mockAcceptAction };
        render(createTestComponent({ actionButton }));

        const acceptButton = screen.getByRole('button', { name: actionButton.label });
        await userEvent.click(acceptButton);

        expect(mockAcceptAction).toHaveBeenCalledTimes(1);
    });

    it('calls the deny action when deny button is clicked', async () => {
        const cancelButton = { label: 'Nope nope', onClick: mockDenyAction };
        render(createTestComponent({ cancelButton }));

        const denyButton = screen.getByRole('button', { name: cancelButton.label });
        await userEvent.click(denyButton);

        expect(mockDenyAction).toHaveBeenCalledTimes(1);
    });
});
