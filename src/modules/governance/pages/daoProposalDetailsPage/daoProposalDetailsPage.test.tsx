import type * as ReactQuery from '@tanstack/react-query';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import * as WagmiActions from 'wagmi/actions';
import { Network } from '../../../../shared/api/daoService';
import { proposalBySlugOptions } from '../../api/governanceService';
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
    const getEnsAddressSpy = jest.spyOn(WagmiActions, 'getEnsAddress');

    beforeEach(() => {
        fetchQuerySpy.mockImplementation(jest.fn());
        getEnsAddressSpy.mockResolvedValue('0x12345');
    });

    afterEach(() => {
        fetchQuerySpy.mockReset();
        getEnsAddressSpy.mockReset();
    });

    const createTestComponent = async (props?: Partial<IDaoProposalDetailsPageProps>) => {
        const completeProps: IDaoProposalDetailsPageProps = {
            params: Promise.resolve({
                proposalSlug: 'proposal-id',
                addressOrEns: 'test.dao.eth',
                network: Network.ETHEREUM_MAINNET,
            }),

            ...props,
        };
        const Component = await DaoProposalDetailsPage(completeProps);

        return Component;
    };

    it('prefetches the proposal from the given proposal ID', async () => {
        const daoEns = 'test.dao.eth';
        const daoAddress = '0x12345';
        const daoNetwork = Network.ETHEREUM_MAINNET;
        const params = { addressOrEns: daoEns, network: daoNetwork, proposalSlug: 'test-proposal-id' };
        const expectedDaoId = `${daoNetwork}-${daoAddress}`;
        const proposalParams = {
            urlParams: { slug: params.proposalSlug },
            queryParams: { daoId: expectedDaoId },
        };
        getEnsAddressSpy.mockResolvedValue(daoAddress);

        render(await createTestComponent({ params: Promise.resolve(params) }));
        expect(fetchQuerySpy.mock.calls[0][0].queryKey).toEqual(proposalBySlugOptions(proposalParams).queryKey);
    });

    it('renders the page client component', async () => {
        render(await createTestComponent());
        expect(screen.getByTestId('page-client-mock')).toBeInTheDocument();
    });

    it('renders error with a link to proposal list page on fetch proposal error', async () => {
        const daoEns = 'test.dao.eth';
        const daoAddress = '0x12345';
        const daoNetwork = Network.ETHEREUM_MAINNET;
        const params = { addressOrEns: daoEns, network: daoNetwork, proposalSlug: '' };
        fetchQuerySpy.mockRejectedValue('error');
        getEnsAddressSpy.mockResolvedValue(daoAddress);

        render(await createTestComponent({ params: Promise.resolve(params) }));
        const errorLink = screen.getByRole('link', { name: /daoProposalDetailsPage.notFound.action/ });
        expect(errorLink).toBeInTheDocument();
        expect(errorLink.getAttribute('href')).toEqual(`/dao/${daoNetwork}/${daoEns}/proposals`);
    });
});
