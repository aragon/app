import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { proposalListOptions } from '../../api/governanceService';
import { DaoProposalsPage, daoProposalsCount, type IDaoProposalsPageProps } from './daoProposalsPage';

jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual('@tanstack/react-query'),
    HydrationBoundary: (props: { children: ReactNode; state?: unknown }) => (
        <div data-testid="hydration-mock" data-state={JSON.stringify(props.state)}>
            {props.children}
        </div>
    ),
}));

jest.mock('./daoProposalsPageClient', () => ({
    DaoProposalsPageClient: () => <div data-testid="page-client-mock" />,
}));

describe('<DaoProposalsPage /> component', () => {
    const prefetchInfiniteQuerySpy = jest.spyOn(QueryClient.prototype, 'prefetchInfiniteQuery');

    beforeEach(() => {
        prefetchInfiniteQuerySpy.mockImplementation(jest.fn());
    });

    afterEach(() => {
        prefetchInfiniteQuerySpy.mockReset();
    });

    const createTestComponent = async (props?: Partial<IDaoProposalsPageProps>) => {
        const completeProps: IDaoProposalsPageProps = {
            params: { id: 'dao-id' },
            ...props,
        };
        const Component = await DaoProposalsPage(completeProps);

        return Component;
    };

    it('prefetches the DAO proposal list from the given dao ID', async () => {
        const params = { id: 'my-dao' };
        const proposalListParams = { daoId: params.id, pageSize: daoProposalsCount };
        render(await createTestComponent({ params }));
        expect(prefetchInfiniteQuerySpy.mock.calls[0][0].queryKey).toEqual(
            proposalListOptions({ queryParams: proposalListParams }).queryKey,
        );
    });

    it('renders the page client component', async () => {
        render(await createTestComponent());
        expect(screen.getByTestId('page-client-mock')).toBeInTheDocument();
    });
});
