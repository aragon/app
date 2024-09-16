import { FormWrapper } from '@/shared/testUtils';
import { render, screen } from '@testing-library/react';
import { forwardRef } from 'react';
import { CreateProposalFormActions, type ICreateProposalFormActionsProps } from './createProposalFormActions';

jest.mock('../../actionComposer', () => ({
    // eslint-disable-next-line react/display-name
    ActionComposer: forwardRef(() => <div data-testid="action-composer-mock" />),
}));

describe('<CreateProposalFormActions /> component', () => {
    const createTestComponent = (props?: Partial<ICreateProposalFormActionsProps>) => {
        const completeProps: ICreateProposalFormActionsProps = {
            daoId: 'test',
            ...props,
        };

        return (
            <FormWrapper>
                <CreateProposalFormActions {...completeProps} />
            </FormWrapper>
        );
    };

    it('renders an empty state', () => {
        render(createTestComponent());
        const emptyState = screen.getByText(/createProposalForm.actions.empty.heading/);
        expect(emptyState).toBeInTheDocument();
    });

    it('renders a button to add an action', () => {
        render(createTestComponent());
        const actionButton = screen.getByRole('button', { name: /createProposalForm.actions.action/ });
        expect(actionButton).toBeInTheDocument();
    });
});
