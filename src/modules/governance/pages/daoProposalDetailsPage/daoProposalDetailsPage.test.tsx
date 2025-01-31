import type * as ReactQuery from '@tanstack/react-query';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { proposalOptions } from '../../api/governanceService';
import { DaoProposalDetailsPage, type IDaoProposalDetailsPageProps } from './daoProposalDetailsPage';

jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual<typeof ReactQuery>('@tanstack/react-query'),
    HydrationBoundary: (props: { children: ReactNode; state?: unknown }) => (
        <div data-testid="hydration-mock" data-state={JSON.stringify(props.state)}>
            {props.children}
        </div>
    ),
}));

jest.mock('./daoProposalDetailsPageClient', () => ({
    DaoProposalDetailsPageClient: () => <div data-testid="page-client-mock" />,
}));

describe('<DaoProposalDetailsPage /> component', () => {
    const fetchQuerySpy = jest.spyOn(QueryClient.prototype, 'fetchQuery');

    beforeEach(() => {
        fetchQuerySpy.mockImplementation(jest.fn());
    });

    afterEach(() => {
        fetchQuerySpy.mockReset();
    });

    const createTestComponent = async (props?: Partial<IDaoProposalDetailsPageProps>) => {
        const completeProps: IDaoProposalDetailsPageProps = {
            params: Promise.resolve({ proposalId: 'proposal-id', id: 'dao-id' }),
            ...props,
        };
        const Component = await DaoProposalDetailsPage(completeProps);

        return Component;
    };

    it('prefetches the proposal from the given proposal ID', async () => {
        const params = { id: 'dao-id', proposalId: 'test-proposal-id' };

        const proposalParams = {
            urlParams: { slug: params.proposalId },
            queryParams: { daoId: params.id },
        };
        render(await createTestComponent({ params: Promise.resolve(params) }));
        expect(fetchQuerySpy.mock.calls[0][0].queryKey).toEqual(proposalOptions(proposalParams).queryKey);
    });

    it('renders the page client component', async () => {
        render(await createTestComponent());
        expect(screen.getByTestId('page-client-mock')).toBeInTheDocument();
    });

    it('renders error with a link to proposal list page on fetch proposal error', async () => {
        const daoId = 'test-dao-id';
        const params = { id: daoId, proposalId: '' };
        fetchQuerySpy.mockRejectedValue('error');
        render(await createTestComponent({ params: Promise.resolve(params) }));
        const errorLink = screen.getByRole('link', { name: /daoProposalDetailsPage.notFound.action/ });
        expect(errorLink).toBeInTheDocument();
        expect(errorLink.getAttribute('href')).toEqual(`/dao/${daoId}/proposals`);
    });
});
