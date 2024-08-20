import { render, screen } from '@testing-library/react';
import { CreateProposalFormSettings, type ICreateProposalFormSettingsProps } from './createProposalFormSettings';

describe('<CreateProposalFormSettings /> component', () => {
    const createTestComponent = (props?: Partial<ICreateProposalFormSettingsProps>) => {
        const completeProps: ICreateProposalFormSettingsProps = { ...props };

        return <CreateProposalFormSettings {...completeProps} />;
    };

    it('renders placeholder text', () => {
        render(createTestComponent());
        expect(screen.getByText('Proposal settings')).toBeInTheDocument();
    });
});
