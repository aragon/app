import { DialogAlertRoot } from '@aragon/ods';
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
            acceptAction: { label: 'Yes, exit', onClick: mockAcceptAction },
            denyAction: { label: 'No, stay', onClick: mockDenyAction },
            ...props,
        };

        return (
            <DialogAlertRoot open={true}>
                <ExitDialog {...completeProps} />
            </DialogAlertRoot>
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
        const acceptAction = { label: 'Yep', onClick: mockAcceptAction };
        const denyAction = { label: 'Nope', onClick: mockDenyAction };
        render(createTestComponent({ acceptAction, denyAction }));

        const acceptButton = screen.getByRole('button', { name: acceptAction.label });
        const denyButton = screen.getByRole('button', { name: denyAction.label });

        expect(acceptButton).toBeInTheDocument();
        expect(denyButton).toBeInTheDocument();
    });

    it('calls the accept action when accept button is clicked', async () => {
        const acceptAction = { label: 'Yep yep', onClick: mockAcceptAction };
        render(createTestComponent({ acceptAction }));

        const acceptButton = screen.getByRole('button', { name: acceptAction.label });
        await userEvent.click(acceptButton);

        expect(mockAcceptAction).toHaveBeenCalledTimes(1);
    });

    it('calls the deny action when deny button is clicked', async () => {
        const denyAction = { label: 'Nope nope', onClick: mockDenyAction };
        render(createTestComponent({ denyAction }));

        const denyButton = screen.getByRole('button', { name: denyAction.label });
        await userEvent.click(denyButton);

        expect(mockDenyAction).toHaveBeenCalledTimes(1);
    });
});
