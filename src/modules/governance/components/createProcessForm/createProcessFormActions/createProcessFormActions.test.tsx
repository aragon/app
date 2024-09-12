import { render, screen } from '@testing-library/react';
import { CreateProcessFormActions, type ICreateProcessFormActionsProps } from './createProcessFormActions';

describe('<CreateProcessFormActions /> component', () => {
    const createTestComponent = (props?: Partial<ICreateProcessFormActionsProps>) => {
        const completeProps: ICreateProcessFormActionsProps = { ...props };

        return <CreateProcessFormActions {...completeProps} />;
    };

    it('renders an empty state', () => {
        render(createTestComponent());
        const emptyState = screen.getByText(/createProcessForm.actions.empty.heading/);
        expect(emptyState).toBeInTheDocument();
    });

    it('renders a button to add an action', () => {
        render(createTestComponent());
        const actionButton = screen.getByRole('button', { name: /createProcessForm.actions.action/ });
        expect(actionButton).toBeInTheDocument();
    });
});
