import { render, screen } from '@testing-library/react';
import type { IUseFeaturedDelegatesPluginResult } from '@/plugins/tokenPlugin/hooks/useFeaturedDelegatesPlugin';
import * as useFeaturedDelegatesPluginHook from '@/plugins/tokenPlugin/hooks/useFeaturedDelegatesPlugin';
import * as daoService from '@/shared/api/daoService';
import { Network } from '@/shared/api/daoService';
import * as useDaoPlugins from '@/shared/hooks/useDaoPlugins';
import {
    generateDao,
    generateDaoPlugin,
    generateFilterComponentPlugin,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import {
    DaoMembersPageClient,
    type IDaoMembersPageClientProps,
} from './daoMembersPageClient';

jest.mock('../../components/daoMemberList', () => ({
    DaoMemberList: { Container: () => <div data-testid="member-list-mock" /> },
}));

jest.mock('@/modules/settings/components/daoPluginInfo', () => ({
    DaoPluginInfo: () => <div data-testid="plugin-info-mock" />,
}));

describe('<DaoMembersPageClient /> component', () => {
    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const useDaoPluginsSpy = jest.spyOn(useDaoPlugins, 'useDaoPlugins');
    const useFeaturedDelegatesPluginSpy = jest.spyOn(
        useFeaturedDelegatesPluginHook,
        'useFeaturedDelegatesPlugin',
    );

    beforeEach(() => {
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: generateDao() }),
        );
        useDaoPluginsSpy.mockReturnValue([
            generateFilterComponentPlugin({ meta: generateDaoPlugin() }),
        ]);
    });

    afterEach(() => {
        useDaoSpy.mockReset();
        useDaoPluginsSpy.mockReset();
        useFeaturedDelegatesPluginSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<IDaoMembersPageClientProps>,
    ) => {
        const completeProps: IDaoMembersPageClientProps = {
            initialParams: {
                queryParams: { daoId: 'test-id', pluginAddress: '0x123' },
            },
            featuredDelegates: [],
            ...props,
        };

        return <DaoMembersPageClient {...completeProps} />;
    };

    it('renders the page title, members list and members page details', () => {
        render(createTestComponent());

        expect(
            screen.getByText(/daoMembersPage.main.title/),
        ).toBeInTheDocument();
        expect(screen.getByTestId('member-list-mock')).toBeInTheDocument();
        expect(screen.getByTestId('plugin-info-mock')).toBeInTheDocument();
    });

    it('renders the aside plugin info on the featured delegates tab for the plugin resolved by the CMS plugin address', () => {
        const pluginAddress = '0x2222222222222222222222222222222222222222';
        const daoAddress = '0x1111111111111111111111111111111111111111';

        const plugin = generateDaoPlugin({ address: pluginAddress });
        useDaoPluginsSpy.mockReturnValue([
            generateFilterComponentPlugin({ meta: plugin }),
        ]);
        // Stub the hook directly — keeps the test plugin-type-agnostic and
        // decoupled from the hook's internal token-voting gate.
        useFeaturedDelegatesPluginSpy.mockReturnValue({
            hasFeaturedDelegates: true,
            featuredDelegatesConfig: {
                daoAddress,
                pluginAddress,
                network: Network.ETHEREUM_MAINNET,
                delegates: ['0x3333333333333333333333333333333333333333'],
            },
            featuredDelegatesPlugin:
                plugin as unknown as (IUseFeaturedDelegatesPluginResult & {
                    hasFeaturedDelegates: true;
                })['featuredDelegatesPlugin'],
        });

        render(createTestComponent());

        expect(screen.getByTestId('plugin-info-mock')).toBeInTheDocument();
    });
});
