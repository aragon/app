import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { memberOptions } from '../../api/governanceService';
import { DaoMemberDetailsPage, type IDaoMemberDetailsPageProps } from './daoMemberDetailsPage';

jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual('@tanstack/react-query'),
    HydrationBoundary: (props: { children: ReactNode; state?: unknown }) => (
        <div data-testid="hydration-mock" data-state={JSON.stringify(props.state)}>
            {props.children}
        </div>
    ),
}));

jest.mock('./daoMemberDetailsPageClient', () => ({
    DaoMemberDetailsPageClient: () => <div data-testid="page-client-mock" />,
}));

describe('<DaoMemberDetailsPage /> component', () => {
    const fetchQuerySpy = jest.spyOn(QueryClient.prototype, 'fetchQuery');

    beforeEach(() => {
        fetchQuerySpy.mockImplementation(jest.fn());
    });

    afterEach(() => {
        fetchQuerySpy.mockReset();
    });

    const createTestComponent = async (props?: Partial<IDaoMemberDetailsPageProps>) => {
        const completeProps: IDaoMemberDetailsPageProps = {
            params: { address: 'test-address', id: 'dao-id' },
            ...props,
        };
        const Component = await DaoMemberDetailsPage(completeProps);

        return Component;
    };

    it('prefetches the DAO member data from the given address and dao ID', async () => {
        const params = { address: 'test-address', id: 'my-dao' };
        const memberParams = {
            urlParams: { address: params.address },
            queryParams: { daoId: params.id },
        };
        render(await createTestComponent({ params }));
        expect(fetchQuerySpy.mock.calls[0][0].queryKey).toEqual(memberOptions(memberParams).queryKey);
    });

    it('renders the page client component', async () => {
        render(await createTestComponent());
        expect(screen.getByTestId('page-client-mock')).toBeInTheDocument();
    });

    it('renders error with a link to proposal list page on fetch proposal error', async () => {
        const daoId = 'test-dao-id';
        fetchQuerySpy.mockRejectedValue('error');
        render(await createTestComponent({ params: { id: daoId, address: '' } }));
        const errorLink = screen.getByRole('link', { name: /daoMemberDetailsPage.notFound.action/ });
        expect(errorLink).toBeInTheDocument();
        expect(errorLink.getAttribute('href')).toEqual(`/dao/${daoId}/members`);
    });
});
