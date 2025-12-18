import type * as ReactQuery from '@tanstack/react-query';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { daoOptions, Network } from '@/shared/api/daoService';
import { generateDao, generateDaoPlugin } from '@/shared/testUtils';
import { PluginType } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { proposalListOptions } from '../../api/governanceService';
import { DaoProposalsPage, daoProposalsCount, daoProposalsSort, type IDaoProposalsPageProps } from './daoProposalsPage';

jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual<typeof ReactQuery>('@tanstack/react-query'),
    HydrationBoundary: (props: { children: ReactNode; state?: unknown }) => (
        <div data-state={JSON.stringify(props.state)} data-testid="hydration-mock">
            {props.children}
        </div>
    ),
}));

jest.mock('./daoProposalsPageClient', () => ({
    DaoProposalsPageClient: () => <div data-testid="page-client-mock" />,
}));

describe('<DaoProposalsPage /> component', () => {
    const fetchQuerySpy = jest.spyOn(QueryClient.prototype, 'fetchQuery');
    const getDaoPluginsSpy = jest.spyOn(daoUtils, 'getDaoPlugins');
    const prefetchInfiniteQuerySpy = jest.spyOn(QueryClient.prototype, 'prefetchInfiniteQuery');
    const resolveDaoIdSpy = jest.spyOn(daoUtils, 'resolveDaoId');

    beforeEach(() => {
        fetchQuerySpy.mockImplementation(jest.fn());
        prefetchInfiniteQuerySpy.mockImplementation(jest.fn());
        getDaoPluginsSpy.mockReturnValue([generateDaoPlugin()]);
        resolveDaoIdSpy.mockResolvedValue('test-dao-id');
    });

    afterEach(() => {
        fetchQuerySpy.mockReset();
        prefetchInfiniteQuerySpy.mockReset();
        getDaoPluginsSpy.mockReset();
        resolveDaoIdSpy.mockReset();
    });

    const createTestComponent = async (props?: Partial<IDaoProposalsPageProps>) => {
        const completeProps: IDaoProposalsPageProps = {
            params: Promise.resolve({ addressOrEns: 'test.dao.eth', network: Network.ETHEREUM_MAINNET }),
            ...props,
        };
        const Component = await DaoProposalsPage(completeProps);

        return Component;
    };

    it('prefetches the DAO proposal list of the first DAO process plugin', async () => {
        const dao = generateDao({ id: 'dao-id' });
        const bodyPlugin = generateDaoPlugin({ address: '0x123' });
        fetchQuerySpy.mockResolvedValue(dao);
        getDaoPluginsSpy.mockReturnValue([bodyPlugin]);
        resolveDaoIdSpy.mockResolvedValue(dao.id);

        render(await createTestComponent());

        expect(fetchQuerySpy.mock.calls[0][0].queryKey).toEqual(daoOptions({ urlParams: { id: dao.id } }).queryKey);
        expect(getDaoPluginsSpy).toHaveBeenCalledWith(dao, { type: PluginType.PROCESS });

        const memberListParams = {
            daoId: dao.id,
            pageSize: daoProposalsCount,
            pluginAddress: bodyPlugin.address,
            sort: daoProposalsSort,
            isSubProposal: false,
            onlyActive: false,
        };
        expect(prefetchInfiniteQuerySpy.mock.calls[0][0].queryKey).toEqual(proposalListOptions({ queryParams: memberListParams }).queryKey);
    });

    it('renders the page client component', async () => {
        render(await createTestComponent());
        expect(screen.getByTestId('page-client-mock')).toBeInTheDocument();
    });
});
