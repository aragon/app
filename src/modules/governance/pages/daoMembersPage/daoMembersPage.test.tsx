import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { memberListOptions } from '../../api/governanceService';
import { DaoMembersPage, daoMembersCount, type IDaoMembersPageProps } from './daoMembersPage';

jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual('@tanstack/react-query'),
    HydrationBoundary: (props: { children: ReactNode; state?: unknown }) => (
        <div data-testid="hydration-mock" data-state={JSON.stringify(props.state)}>
            {props.children}
        </div>
    ),
}));

jest.mock('./daoMembersPageClient', () => ({
    DaoMembersPageClient: () => <div data-testid="page-client-mock" />,
}));

describe('<DaoMembersPage /> component', () => {
    const prefetchInfiniteQuerySpy = jest.spyOn(QueryClient.prototype, 'prefetchInfiniteQuery');

    beforeEach(() => {
        prefetchInfiniteQuerySpy.mockImplementation(jest.fn());
    });

    afterEach(() => {
        prefetchInfiniteQuerySpy.mockReset();
    });

    const createTestComponent = async (props?: Partial<IDaoMembersPageProps>) => {
        const completeProps: IDaoMembersPageProps = {
            params: { id: 'dao-id' },
            ...props,
        };
        const Component = await DaoMembersPage(completeProps);

        return Component;
    };

    it('prefetches the DAO member list from the given dao ID', async () => {
        const params = { id: 'my-dao' };
        const memberListParams = { daoId: params.id, pageSize: daoMembersCount, pluginAddress: '0x123' };
        render(await createTestComponent({ params }));
        expect(prefetchInfiniteQuerySpy.mock.calls[0][0].queryKey).toEqual(
            memberListOptions({ queryParams: memberListParams }).queryKey,
        );
    });

    it('renders the page client component', async () => {
        render(await createTestComponent());
        expect(screen.getByTestId('page-client-mock')).toBeInTheDocument();
    });
});
