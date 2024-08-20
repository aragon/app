import { render, screen } from '@testing-library/react';
import { CreateProposalFormActions, type ICreateProposalFormActionsProps } from './createProposalFormActions';

describe('<CreateProposalFormActions /> component', () => {
    const createTestComponent = (props?: Partial<ICreateProposalFormActionsProps>) => {
        const completeProps: ICreateProposalFormActionsProps = { ...props };

        return <CreateProposalFormActions {...completeProps} />;
    };

    it('renders placeholder text', () => {
        render(createTestComponent());
        expect(screen.getByText('Add actions')).toBeInTheDocument();
    });
});
