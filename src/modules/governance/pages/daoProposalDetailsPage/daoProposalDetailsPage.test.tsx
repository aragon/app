import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { proposalOptions } from '../../api/governanceService';
import { DaoProposalDetailsPage, type IDaoProposalDetailsPageProps } from './daoProposalDetailsPage';

jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual('@tanstack/react-query'),
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
    const prefetchQuerySpy = jest.spyOn(QueryClient.prototype, 'prefetchQuery');

    beforeEach(() => {
        prefetchQuerySpy.mockImplementation(jest.fn());
    });

    afterEach(() => {
        prefetchQuerySpy.mockReset();
    });

    const createTestComponent = async (props?: Partial<IDaoProposalDetailsPageProps>) => {
        const completeProps: IDaoProposalDetailsPageProps = {
            params: { proposalId: 'proposal-id', id: 'dao-id' },
            ...props,
        };
        const Component = await DaoProposalDetailsPage(completeProps);

        return Component;
    };

    it('prefetches the proposal from the given proposal ID', async () => {
        const params = { id: 'dao-id', proposalId: 'test-proposal-id' };
        const proposalParams = {
            urlParams: { id: params.proposalId },
        };
        render(await createTestComponent({ params }));
        expect(prefetchQuerySpy.mock.calls[0][0].queryKey).toEqual(proposalOptions(proposalParams).queryKey);
    });

    it('renders the page client component', async () => {
        render(await createTestComponent());
        expect(screen.getByTestId('page-client-mock')).toBeInTheDocument();
    });
});
