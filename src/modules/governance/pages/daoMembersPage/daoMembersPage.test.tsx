import { daoOptions, Network } from '@/shared/api/daoService';
import { generateDao, generateDaoPlugin } from '@/shared/testUtils';
import { PluginType } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import type * as ReactQuery from '@tanstack/react-query';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import * as WagmiActions from 'wagmi/actions';
import { memberListOptions } from '../../api/governanceService';
import { daoMembersCount, DaoMembersPage, type IDaoMembersPageProps } from './daoMembersPage';

jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual<typeof ReactQuery>('@tanstack/react-query'),
    HydrationBoundary: (props: { children: ReactNode; state?: unknown }) => (
        <div data-testid="hydration-mock" data-state={JSON.stringify(props.state)}>
            {props.children}
        </div>
    ),
}));

jest.mock('./daoMembersPageClient', () => ({ DaoMembersPageClient: () => <div data-testid="page-client-mock" /> }));

describe('<DaoMembersPage /> component', () => {
    const fetchQuerySpy = jest.spyOn(QueryClient.prototype, 'fetchQuery');
    const getDaoPluginsSpy = jest.spyOn(daoUtils, 'getDaoPlugins');
    const prefetchInfiniteQuerySpy = jest.spyOn(QueryClient.prototype, 'prefetchInfiniteQuery');
    const getEnsAddressSpy = jest.spyOn(WagmiActions, 'getEnsAddress');

    beforeEach(() => {
        fetchQuerySpy.mockImplementation(jest.fn());
        prefetchInfiniteQuerySpy.mockImplementation(jest.fn());
        getDaoPluginsSpy.mockReturnValue([generateDaoPlugin()]);
        getEnsAddressSpy.mockResolvedValue('0x12345');
    });

    afterEach(() => {
        fetchQuerySpy.mockReset();
        prefetchInfiniteQuerySpy.mockReset();
        getDaoPluginsSpy.mockReset();
        getEnsAddressSpy.mockReset();
    });

    const createTestComponent = async (props?: Partial<IDaoMembersPageProps>) => {
        const completeProps: IDaoMembersPageProps = {
            params: Promise.resolve({ id: 'test.dao.eth', network: Network.ETHEREUM_MAINNET }),
            ...props,
        };
        const Component = await DaoMembersPage(completeProps);

        return Component;
    };

    it('prefetches the DAO member list of the first DAO body plugin', async () => {
        const daoEns = 'test.dao.eth';
        const daoAddress = '0x12345';
        const daoNetwork = Network.ETHEREUM_MAINNET;
        const expectedDaoId = `${daoNetwork}-${daoAddress}`;
        const dao = generateDao({ id: expectedDaoId, address: daoAddress, ens: daoEns });
        const bodyPlugin = generateDaoPlugin({ address: '0x123' });
        fetchQuerySpy.mockResolvedValue(dao);
        getDaoPluginsSpy.mockReturnValue([bodyPlugin]);
        getEnsAddressSpy.mockResolvedValue(daoAddress);

        const params = { id: daoEns, network: daoNetwork };
        render(await createTestComponent({ params: Promise.resolve(params) }));

        expect(fetchQuerySpy.mock.calls[0][0].queryKey).toEqual(
            daoOptions({ urlParams: { id: expectedDaoId } }).queryKey,
        );
        expect(getDaoPluginsSpy).toHaveBeenCalledWith(dao, { type: PluginType.BODY, includeSubPlugins: true });

        const memberListParams = { daoId: expectedDaoId, pageSize: daoMembersCount, pluginAddress: bodyPlugin.address };
        expect(prefetchInfiniteQuerySpy.mock.calls[0][0].queryKey).toEqual(
            memberListOptions({ queryParams: memberListParams }).queryKey,
        );
    });

    it('renders the page client component', async () => {
        render(await createTestComponent());
        expect(screen.getByTestId('page-client-mock')).toBeInTheDocument();
    });
});
