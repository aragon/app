import { render, screen } from '@testing-library/react';
import { CreateProposalPageClient, type ICreateProposalPageClientProps } from './createProposalPageClient';

jest.mock('./createProposalPageClientSteps', () => ({
    CreateProposalPageClientSteps: () => <div data-testid="steps-mock" />,
}));

describe('<CreateProposalPageClient /> component', () => {
    const createTestComponent = (props?: Partial<ICreateProposalPageClientProps>) => {
        const completeProps: ICreateProposalPageClientProps = {
            daoId: 'test',
            ...props,
        };

        return <CreateProposalPageClient {...completeProps} />;
    };

    it('renders the create-proposal wizard steps', () => {
        render(createTestComponent());
        expect(screen.getByText(/wizard.container.step \(number=1\)/)).toBeInTheDocument();
        expect(screen.getByText(/wizard.container.total \(total=3\)/)).toBeInTheDocument();
        expect(screen.getByTestId('steps-mock')).toBeInTheDocument();
    });
});
