import { render, screen } from '@testing-library/react';
import { DaoProposalsPageClient, type IDaoProposalsPageClientProps } from './daoProposalsPageClient';

jest.mock('../../components/daoProposalList', () => ({
    DaoProposalList: () => <div data-testid="proposal-list-mock" />,
}));

jest.mock('@/modules/settings/components/daoGovernanceInfo', () => ({
    DaoGovernanceInfo: () => <div data-testid="governance-info-mock" />,
}));

describe('<DaoProposalsPageClient /> component', () => {
    const createTestComponent = (props?: Partial<IDaoProposalsPageClientProps>) => {
        const completeProps: IDaoProposalsPageClientProps = {
            initialParams: { queryParams: { daoId: 'test-id' } },
            ...props,
        };

        return <DaoProposalsPageClient {...completeProps} />;
    };

    it('renders the page title, proposals list and proposals page details', () => {
        render(createTestComponent());
        expect(screen.getByText(/daoProposalsPage.main.title/)).toBeInTheDocument();
        expect(screen.getByText(/daoProposalsPage.aside.details.title/)).toBeInTheDocument();
        expect(screen.getByTestId('proposal-list-mock')).toBeInTheDocument();
        expect(screen.getByTestId('governance-info-mock')).toBeInTheDocument();
    });

    it('renders the create proposal button with the correct link', () => {
        const daoId = 'test-id';
        const initialParams = { queryParams: { daoId } };
        render(createTestComponent({ initialParams }));
        const createProposalButton = screen.getByRole<HTMLAnchorElement>('link', {
            name: /daoProposalsPage.main.action/,
        });
        expect(createProposalButton).toBeInTheDocument();
        expect(createProposalButton).toHaveAttribute('href', `/dao/${daoId}/create/proposal`);
    });
});
