import type * as ReactQuery from '@tanstack/react-query';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { featuredDaosOptions } from '../../api/cmsService';
import { daoListOptions } from '../../api/daoExplorerService';
import { ExploreDaosPage, type IExploreDaosPageProps } from './exploreDaosPage';

jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual<typeof ReactQuery>('@tanstack/react-query'),
    HydrationBoundary: (props: { children: ReactNode; state?: unknown }) => (
        <div data-testid="hydration-mock" data-state={JSON.stringify(props.state)}>
            {props.children}
        </div>
    ),
}));

jest.mock('./exploreDaosPageClient', () => ({
    ExploreDaosPageClient: () => <div data-testid="page-client-mock" />,
}));

describe('<ExploreDaosPage /> component', () => {
    const prefetchInfiniteQuerySpy = jest.spyOn(QueryClient.prototype, 'prefetchInfiniteQuery');
    const prefetchQuerySpy = jest.spyOn(QueryClient.prototype, 'prefetchQuery');

    beforeEach(() => {
        prefetchInfiniteQuerySpy.mockImplementation(jest.fn());
        prefetchQuerySpy.mockImplementation(jest.fn());
    });

    afterEach(() => {
        prefetchInfiniteQuerySpy.mockReset();
        prefetchQuerySpy.mockReset();
    });

    const createTestComponent = async (props?: Partial<IExploreDaosPageProps>) => {
        const completeProps: IExploreDaosPageProps = { ...props };
        const Component = await ExploreDaosPage(completeProps);

        return Component;
    };

    it('prefetches the list of DAOs', async () => {
        render(await createTestComponent());
        expect(prefetchInfiniteQuerySpy.mock.calls[0][0].queryKey).toEqual(
            daoListOptions({ queryParams: { pageSize: 10, page: 1, sort: 'metrics.tvlUSD' } }).queryKey,
        );
    });

    it('prefetches the featured DAOs', async () => {
        render(await createTestComponent());
        expect(prefetchQuerySpy.mock.calls[0][0].queryKey).toEqual(featuredDaosOptions().queryKey);
    });

    it('renders the page client component', async () => {
        render(await createTestComponent());
        expect(screen.getByTestId('page-client-mock')).toBeInTheDocument();
    });
});
