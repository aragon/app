import { render, screen } from '@testing-library/react';
import { CreateProposalFormActions, type ICreateProposalFormActionsProps } from './createProposalFormActions';

describe('<CreateProposalFormActions /> component', () => {
    const createTestComponent = (props?: Partial<ICreateProposalFormActionsProps>) => {
        const completeProps: ICreateProposalFormActionsProps = { ...props };

        return <CreateProposalFormActions {...completeProps} />;
    };

    it('renders an empty state', () => {
        render(createTestComponent());
        expect(
            screen.getByText(/app.governance.createProposal.createProposalFormActions.emptyState.heading/),
        ).toBeInTheDocument();
    });

    it('renders a button to add an action', () => {
        render(createTestComponent());
        expect(
            screen.getByText(/app.governance.createProposal.createProposalFormActions.buttons.action/),
        ).toBeInTheDocument();
    });
});
