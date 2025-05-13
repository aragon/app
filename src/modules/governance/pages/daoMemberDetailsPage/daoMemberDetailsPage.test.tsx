import { Network } from '@/shared/api/daoService';
import { daoUtils } from '@/shared/utils/daoUtils';
import type * as ReactQuery from '@tanstack/react-query';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { memberOptions } from '../../api/governanceService';
import { DaoMemberDetailsPage, type IDaoMemberDetailsPageProps } from './daoMemberDetailsPage';

jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual<typeof ReactQuery>('@tanstack/react-query'),
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
    const resolveDaoIdSpy = jest.spyOn(daoUtils, 'resolveDaoId');

    beforeEach(() => {
        fetchQuerySpy.mockImplementation(jest.fn());
        resolveDaoIdSpy.mockResolvedValue('test-dao-id');
    });

    afterEach(() => {
        fetchQuerySpy.mockReset();
        resolveDaoIdSpy.mockReset();
    });

    const createTestComponent = async (props?: Partial<IDaoMemberDetailsPageProps>) => {
        const completeProps: IDaoMemberDetailsPageProps = {
            params: Promise.resolve({
                address: 'test-address',
                addressOrEns: 'test.dao.eth',
                network: Network.ETHEREUM_MAINNET,
            }),
            ...props,
        };
        const Component = await DaoMemberDetailsPage(completeProps);

        return Component;
    };

    it('prefetches the DAO member data from the given address and dao ID', async () => {
        const params = { addressOrEns: 'test.dao.eth', network: Network.ETHEREUM_SEPOLIA, address: 'test-address' };
        const expectedDaoId = 'test-dao-id';
        const memberParams = {
            urlParams: { address: params.address },
            queryParams: { daoId: expectedDaoId },
        };
        resolveDaoIdSpy.mockResolvedValue(expectedDaoId);
        render(await createTestComponent({ params: Promise.resolve(params) }));
        expect(fetchQuerySpy.mock.calls[0][0].queryKey).toEqual(memberOptions(memberParams).queryKey);
    });

    it('renders the page client component', async () => {
        render(await createTestComponent());
        expect(screen.getByTestId('page-client-mock')).toBeInTheDocument();
    });

    it('renders error with a link to proposal list page on fetch proposal error', async () => {
        const daoEns = 'test.dao.eth';
        const daoNetwork = Network.ETHEREUM_MAINNET;
        const params = { addressOrEns: daoEns, network: daoNetwork, address: '' };

        fetchQuerySpy.mockRejectedValue('error');
        render(await createTestComponent({ params: Promise.resolve(params) }));
        const errorLink = screen.getByRole('link', { name: /daoMemberDetailsPage.notFound.action/ });
        expect(errorLink).toBeInTheDocument();
        expect(errorLink.getAttribute('href')).toEqual(`/dao/${daoNetwork}/${daoEns}/members`);
    });
});
