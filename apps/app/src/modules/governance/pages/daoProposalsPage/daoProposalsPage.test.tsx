import type * as ReactQuery from '@tanstack/react-query';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { safeDaoProposalsOptions } from '@/plugins/safeMultisigPlugin/hooks/useSafeDaoProposals';
import {
    daoOptions,
    Network,
    PluginInterfaceType,
} from '@/shared/api/daoService';
import { safeInfoOptions } from '@/shared/api/safeService';
import { generateDao, generateDaoPlugin } from '@/shared/testUtils';
import { PluginType } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { proposalListOptions } from '../../api/governanceService';
import {
    DaoProposalsPage,
    daoProposalsCount,
    daoProposalsSort,
    type IDaoProposalsPageProps,
} from './daoProposalsPage';

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

jest.mock('./daoProposalsPageClient', () => ({
    DaoProposalsPageClient: () => <div data-testid="page-client-mock" />,
}));

describe('<DaoProposalsPage /> component', () => {
    const fetchQuerySpy = jest.spyOn(QueryClient.prototype, 'fetchQuery');
    const prefetchQuerySpy = jest.spyOn(QueryClient.prototype, 'prefetchQuery');
    const getDaoPluginsSpy = jest.spyOn(daoUtils, 'getDaoPlugins');
    const prefetchInfiniteQuerySpy = jest.spyOn(
        QueryClient.prototype,
        'prefetchInfiniteQuery',
    );
    const resolveDaoIdSpy = jest.spyOn(daoUtils, 'resolveDaoId');

    beforeEach(() => {
        fetchQuerySpy.mockResolvedValue({});
        prefetchQuerySpy.mockImplementation(jest.fn());
        prefetchInfiniteQuerySpy.mockImplementation(jest.fn());
        getDaoPluginsSpy.mockReturnValue([generateDaoPlugin()]);
        resolveDaoIdSpy.mockResolvedValue('test-dao-id');
    });

    afterEach(() => {
        fetchQuerySpy.mockReset();
        prefetchQuerySpy.mockReset();
        prefetchInfiniteQuerySpy.mockReset();
        getDaoPluginsSpy.mockReset();
        resolveDaoIdSpy.mockReset();
    });

    const createTestComponent = async (
        props?: Partial<IDaoProposalsPageProps>,
    ) => {
        const completeProps: IDaoProposalsPageProps = {
            params: Promise.resolve({
                addressOrEns: 'test.dao.eth',
                network: Network.ETHEREUM_MAINNET,
            }),
            ...props,
        };
        const Component = await DaoProposalsPage(completeProps);

        return Component;
    };

    it('prefetches the DAO proposal list of the first DAO process plugin', async () => {
        const dao = generateDao({ id: 'dao-id' });
        const bodyPlugin = generateDaoPlugin({ address: '0x123' });
        fetchQuerySpy.mockResolvedValueOnce(dao).mockResolvedValue({});
        getDaoPluginsSpy.mockReturnValue([bodyPlugin]);
        resolveDaoIdSpy.mockResolvedValue(dao.id);

        render(await createTestComponent());

        expect(fetchQuerySpy.mock.calls[0][0].queryKey).toEqual(
            daoOptions({ urlParams: { id: dao.id } }).queryKey,
        );
        expect(getDaoPluginsSpy).toHaveBeenCalledWith(dao, {
            type: PluginType.PROCESS,
            includeLinkedAccounts: true,
        });

        const memberListParams = {
            daoId: dao.id,
            pageSize: daoProposalsCount,
            pluginAddress: bodyPlugin.address,
            sort: daoProposalsSort,
            isSubProposal: false,
            onlyActive: false,
            includeLinkedAccounts: false,
        };
        expect(prefetchInfiniteQuerySpy.mock.calls[0][0].queryKey).toEqual(
            proposalListOptions({ queryParams: memberListParams }).queryKey,
        );
    });

    it('prefetches Safe info and proposals for a single Safe process', async () => {
        const safeAddress = '0x1234567890123456789012345678901234567890';
        const linkedDaoAddress = '0x9876543210987654321098765432109876543210';
        const dao = generateDao({
            network: Network.ETHEREUM_SEPOLIA,
        });
        const safePlugin = generateDaoPlugin({
            address: safeAddress,
            daoAddress: linkedDaoAddress,
            interfaceType: PluginInterfaceType.SAFE,
            isProcess: true,
        });
        fetchQuerySpy.mockResolvedValueOnce(dao).mockResolvedValue({});
        getDaoPluginsSpy.mockReturnValue([safePlugin]);

        render(await createTestComponent());

        expect(prefetchQuerySpy.mock.calls[0][0].queryKey).toEqual(
            safeInfoOptions({
                urlParams: {
                    network: dao.network,
                    address: safeAddress,
                },
            }).queryKey,
        );
        expect(prefetchInfiniteQuerySpy.mock.calls[0][0].queryKey).toEqual(
            safeDaoProposalsOptions({
                network: dao.network,
                safeAddress,
                daoAddress: linkedDaoAddress,
            }).queryKey,
        );
    });

    it('renders the page client component', async () => {
        render(await createTestComponent());
        expect(screen.getByTestId('page-client-mock')).toBeInTheDocument();
    });
});
