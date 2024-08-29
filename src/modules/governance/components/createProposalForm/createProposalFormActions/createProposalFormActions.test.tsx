import { render, screen } from '@testing-library/react';
import { CreateProposalFormActions, type ICreateProposalFormActionsProps } from './createProposalFormActions';

describe('<CreateProposalFormActions /> component', () => {
    const createTestComponent = (props?: Partial<ICreateProposalFormActionsProps>) => {
        const completeProps: ICreateProposalFormActionsProps = { ...props };

        return <CreateProposalFormActions {...completeProps} />;
    };

    it('renders an empty state', () => {
        render(createTestComponent());
        const emptyState = screen.getByText(/createProposalForm.actions.empty.heading/);
        expect(emptyState).toBeInTheDocument();
    });

    it('renders a button to add an action', () => {
        render(createTestComponent());
        const actionButton = screen.getByRole('button', {
            name: /createProposalForm.actions.action/,
        });
        expect(actionButton).toBeInTheDocument();
    });
});
