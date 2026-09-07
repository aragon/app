import type * as ReactQuery from '@tanstack/react-query';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import {
    daoOptions,
    Network,
    PluginInterfaceType,
} from '@/shared/api/daoService';
import { featureFlags } from '@/shared/featureFlags';
import {
    generateDao,
    generateDaoPlugin,
    generatePluginSettings,
} from '@/shared/testUtils';
import { PluginType } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import {
    buildTokenVotingMembershipParams,
    memberListOptions,
    tokenVotingMembershipOptions,
} from '../../api/governanceService';
import {
    DaoMembersPage,
    daoMembersCount,
    type IDaoMembersPageProps,
} from './daoMembersPage';

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

jest.mock('./daoMembersPageClient', () => ({
    DaoMembersPageClient: () => <div data-testid="page-client-mock" />,
}));

describe('<DaoMembersPage /> component', () => {
    const fetchQuerySpy = jest.spyOn(QueryClient.prototype, 'fetchQuery');
    const prefetchQuerySpy = jest.spyOn(QueryClient.prototype, 'prefetchQuery');
    const getDaoPluginsSpy = jest.spyOn(daoUtils, 'getDaoPlugins');
    const prefetchInfiniteQuerySpy = jest.spyOn(
        QueryClient.prototype,
        'prefetchInfiniteQuery',
    );
    const resolveDaoIdSpy = jest.spyOn(daoUtils, 'resolveDaoId');
    const isFeatureEnabledSpy = jest.spyOn(featureFlags, 'isEnabled');

    beforeEach(() => {
        fetchQuerySpy
            .mockResolvedValueOnce(generateDao())
            .mockResolvedValue({});
        prefetchQuerySpy.mockImplementation(jest.fn());
        prefetchInfiniteQuerySpy.mockImplementation(jest.fn());
        getDaoPluginsSpy.mockReturnValue([generateDaoPlugin()]);
        resolveDaoIdSpy.mockResolvedValue('test-dao-id');
        isFeatureEnabledSpy.mockResolvedValue(false);
    });

    afterEach(() => {
        fetchQuerySpy.mockReset();
        prefetchQuerySpy.mockReset();
        prefetchInfiniteQuerySpy.mockReset();
        getDaoPluginsSpy.mockReset();
        resolveDaoIdSpy.mockReset();
        isFeatureEnabledSpy.mockReset();
    });

    const createTestComponent = async (
        props?: Partial<IDaoMembersPageProps>,
    ) => {
        const completeProps: IDaoMembersPageProps = {
            params: Promise.resolve({
                addressOrEns: 'test.dao.eth',
                network: Network.ETHEREUM_MAINNET,
            }),
            ...props,
        };
        const Component = await DaoMembersPage(completeProps);

        return Component;
    };

    it('prefetches the DAO member list of the first DAO body plugin', async () => {
        const expectedDaoId = 'test-dao-id';
        const dao = generateDao();
        const bodyPlugin = generateDaoPlugin({ address: '0x123' });
        resolveDaoIdSpy.mockResolvedValue(expectedDaoId);
        fetchQuerySpy.mockResolvedValue(dao);
        getDaoPluginsSpy.mockReturnValue([bodyPlugin]);

        render(await createTestComponent());

        expect(fetchQuerySpy.mock.calls[0][0].queryKey).toEqual(
            daoOptions({ urlParams: { id: expectedDaoId } }).queryKey,
        );
        expect(getDaoPluginsSpy).toHaveBeenCalledWith(dao, {
            type: PluginType.BODY,
            includeSubPlugins: true,
            includeLinkedAccounts: true,
        });

        const memberListParams = {
            daoId: expectedDaoId,
            pageSize: daoMembersCount,
            pluginAddress: bodyPlugin.address,
        };
        expect(prefetchInfiniteQuerySpy.mock.calls[0][0].queryKey).toEqual(
            memberListOptions({ queryParams: memberListParams }).queryKey,
        );
    });

    it('prefetches the token-voting membership query for token-voting body plugins with the resolved domain-source flag', async () => {
        const expectedDaoId = 'test-dao-id';
        const dao = generateDao({ network: Network.ETHEREUM_MAINNET });
        const bodyPlugin = generateDaoPlugin({
            address: '0x123',
            interfaceType: PluginInterfaceType.TOKEN_VOTING,
            settings: {
                ...generatePluginSettings(),
                token: { address: '0xToken', underlying: null },
            },
        });
        resolveDaoIdSpy.mockResolvedValue(expectedDaoId);
        fetchQuerySpy.mockResolvedValue(dao);
        getDaoPluginsSpy.mockReturnValue([bodyPlugin]);
        isFeatureEnabledSpy.mockResolvedValue(true);

        render(await createTestComponent());

        expect(isFeatureEnabledSpy).toHaveBeenCalledWith('domainMemberList');
        const expectedParams = buildTokenVotingMembershipParams(
            {
                queryParams: {
                    daoId: expectedDaoId,
                    pluginAddress: bodyPlugin.address,
                    pageSize: daoMembersCount,
                },
            },
            bodyPlugin,
            dao,
            { domainSourceEnabled: true },
        );
        expect(prefetchInfiniteQuerySpy.mock.calls[0][0].queryKey).toEqual(
            tokenVotingMembershipOptions(expectedParams).queryKey,
        );
    });

    it('renders the page client component', async () => {
        render(await createTestComponent());
        expect(screen.getByTestId('page-client-mock')).toBeInTheDocument();
    });
});
