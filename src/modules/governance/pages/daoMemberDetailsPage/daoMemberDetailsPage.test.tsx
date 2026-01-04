import type * as ReactQuery from '@tanstack/react-query';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { daoService, Network } from '@/shared/api/daoService';
import { generateDao, generateDaoPlugin } from '@/shared/testUtils';
import { daoUtils } from '@/shared/utils/daoUtils';
import { memberOptions } from '../../api/governanceService';
import {
    DaoMemberDetailsPage,
    type IDaoMemberDetailsPageProps,
} from './daoMemberDetailsPage';

jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual<typeof ReactQuery>('@tanstack/react-query'),
    HydrationBoundary: (props: { children: ReactNode; state?: unknown }) => (
        <div
            data-state={JSON.stringify(props.state)}
            data-testid="hydration-mock"
        >
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
    const getDaoSpy = jest.spyOn(daoService, 'getDao');

    beforeEach(() => {
        fetchQuerySpy.mockImplementation(jest.fn());
        resolveDaoIdSpy.mockResolvedValue('test-dao-id');
        getDaoSpy.mockResolvedValue(
            generateDao({ plugins: [generateDaoPlugin()] }),
        );
    });

    afterEach(() => {
        fetchQuerySpy.mockReset();
        resolveDaoIdSpy.mockReset();
        getDaoSpy.mockReset();
    });

    const createTestComponent = async (
        props?: Partial<IDaoMemberDetailsPageProps>,
    ) => {
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
        const dao = generateDao({
            plugins: [generateDaoPlugin({ address: 'test-plugin-address' })],
        });
        const params = {
            addressOrEns: 'test.dao.eth',
            network: Network.ETHEREUM_SEPOLIA,
            address: 'test-address',
            pluginAddress: dao.plugins[0].address,
        };
        const expectedDaoId = 'test-dao-id';
        const memberParams = {
            urlParams: { address: params.address },
            queryParams: {
                daoId: expectedDaoId,
                pluginAddress: params.pluginAddress,
            },
        };
        resolveDaoIdSpy.mockResolvedValue(expectedDaoId);
        getDaoSpy.mockResolvedValue(dao);

        render(await createTestComponent({ params: Promise.resolve(params) }));
        expect(fetchQuerySpy.mock.calls[0][0].queryKey).toEqual(
            memberOptions(memberParams).queryKey,
        );
    });

    it('renders the page client component', async () => {
        render(await createTestComponent());
        expect(screen.getByTestId('page-client-mock')).toBeInTheDocument();
    });

    it('renders error with a link to proposal list page on fetch proposal error', async () => {
        const daoEns = 'test.dao.eth';
        const daoNetwork = Network.ETHEREUM_MAINNET;
        const params = {
            addressOrEns: daoEns,
            network: daoNetwork,
            address: '',
        };

        fetchQuerySpy.mockRejectedValue('error');
        render(await createTestComponent({ params: Promise.resolve(params) }));
        const errorLink = screen.getByRole('link', {
            name: /daoMemberDetailsPage.error.action/,
        });
        expect(errorLink).toBeInTheDocument();
        expect(errorLink.getAttribute('href')).toEqual(
            `/dao/${daoNetwork}/${daoEns}/members`,
        );
    });
});
