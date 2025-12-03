import { AssetList } from '@/modules/finance/components/assetList';
import * as daoService from '@/shared/api/daoService';
import * as useDaoPluginFilterUrlParam from '@/shared/hooks/useDaoPluginFilterUrlParam/useDaoPluginFilterUrlParam';
import { pluginGroupFilter } from '@/shared/hooks/useDaoPlugins';
import { generateDao, generateDaoPlugin } from '@/shared/testUtils';
import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';

jest.mock('@/modules/finance/components/assetList/assetListDefault', () => ({
    AssetListDefault: () => <div data-testid="asset-list-default">AssetListDefault Mock</div>,
}));

jest.mock('@/shared/components/pluginFilterComponent', () => ({
    PluginFilterComponent: (props: { plugins?: unknown[]; children?: React.ReactNode }) => (
        <div data-testid="plugin-filter-component">
            Plugins: {props.plugins?.length ?? 0}
            {props.children}
        </div>
    ),
}));

describe('<AssetList.Container /> component', () => {
    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const useDaoPluginFilterUrlParamSpy = jest.spyOn(useDaoPluginFilterUrlParam, 'useDaoPluginFilterUrlParam');

    beforeEach(() => {
        useDaoSpy.mockReturnValue({
            data: generateDao({ id: 'test-dao', address: '0x123', subDaos: [] }),
            isLoading: false,
            error: null,
        } as ReturnType<typeof daoService.useDao>);

        useDaoPluginFilterUrlParamSpy.mockReturnValue({
            activePlugin: undefined,
            setActivePlugin: jest.fn(),
            plugins: [
                {
                    id: pluginGroupFilter.id,
                    uniqueId: pluginGroupFilter.id,
                    label: 'All',
                    meta: pluginGroupFilter as unknown as daoService.IDaoPlugin,
                    props: {},
                },
            ],
        });
    });

    afterEach(() => {
        useDaoSpy.mockReset();
        useDaoPluginFilterUrlParamSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<React.ComponentProps<typeof AssetList.Container>>) => {
        const completeProps: React.ComponentProps<typeof AssetList.Container> = {
            initialParams: { queryParams: { daoId: 'test-dao' } },
            daoId: 'test-dao',
            ...props,
        };

        return (
            <GukModulesProvider>
                <AssetList.Container {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders the PluginFilterComponent with processed plugins', () => {
        render(createTestComponent());
        expect(screen.getByTestId('plugin-filter-component')).toBeInTheDocument();
        expect(screen.getByText(/Plugins: 1/)).toBeInTheDocument();
    });

    it('processes plugins and removes duplicates based on DAO address', () => {
        const bodyPlugin1 = generateDaoPlugin({
            address: '0xPlugin1',
            daoAddress: '0xSubDao1',
        });
        const bodyPlugin2 = generateDaoPlugin({
            address: '0xPlugin2',
            daoAddress: '0xSubDao1', // Same DAO address - should be deduplicated
        });
        const bodyPlugin3 = generateDaoPlugin({
            address: '0xPlugin3',
            daoAddress: '0xSubDao2',
        });

        useDaoPluginFilterUrlParamSpy.mockReturnValue({
            activePlugin: undefined,
            setActivePlugin: jest.fn(),
            plugins: [
                {
                    id: pluginGroupFilter.id,
                    uniqueId: pluginGroupFilter.id,
                    label: 'All',
                    meta: pluginGroupFilter as unknown as daoService.IDaoPlugin,
                    props: {},
                },
                {
                    id: bodyPlugin1.address,
                    uniqueId: `${bodyPlugin1.address}-1`,
                    label: 'Plugin 1',
                    meta: bodyPlugin1,
                    props: {},
                },
                {
                    id: bodyPlugin2.address,
                    uniqueId: `${bodyPlugin2.address}-2`,
                    label: 'Plugin 2',
                    meta: bodyPlugin2,
                    props: {},
                },
                {
                    id: bodyPlugin3.address,
                    uniqueId: `${bodyPlugin3.address}-3`,
                    label: 'Plugin 3',
                    meta: bodyPlugin3,
                    props: {},
                },
            ],
        });

        render(createTestComponent());

        // Should have 3 plugins: group filter + 2 unique SubDAOs (plugin2 is deduplicated)
        expect(screen.getByText(/Plugins: 3/)).toBeInTheDocument();
    });

    it('uses the group filter label for the "All" tab', () => {
        useDaoPluginFilterUrlParamSpy.mockReturnValue({
            activePlugin: undefined,
            setActivePlugin: jest.fn(),
            plugins: [
                {
                    id: pluginGroupFilter.id,
                    uniqueId: pluginGroupFilter.id,
                    label: 'All',
                    meta: pluginGroupFilter as unknown as daoService.IDaoPlugin,
                    props: {},
                },
            ],
        });

        render(createTestComponent());
        expect(screen.getByTestId('plugin-filter-component')).toBeInTheDocument();
    });

    it('passes correct query params for group tab (all SubDAOs)', () => {
        render(createTestComponent());
        // Group tab should use the parent daoId without onlyParent flag
        expect(screen.getByTestId('plugin-filter-component')).toBeInTheDocument();
    });

    it('passes correct query params for individual SubDAO tabs', () => {
        const bodyPlugin = generateDaoPlugin({
            address: '0xPlugin1',
            daoAddress: '0xSubDao1',
        });

        useDaoPluginFilterUrlParamSpy.mockReturnValue({
            activePlugin: undefined,
            setActivePlugin: jest.fn(),
            plugins: [
                {
                    id: pluginGroupFilter.id,
                    uniqueId: pluginGroupFilter.id,
                    label: 'All',
                    meta: pluginGroupFilter as unknown as daoService.IDaoPlugin,
                    props: {},
                },
                {
                    id: bodyPlugin.address,
                    uniqueId: `${bodyPlugin.address}-1`,
                    label: 'SubDAO 1',
                    meta: bodyPlugin,
                    props: {},
                },
            ],
        });

        render(createTestComponent());
        expect(screen.getByText(/Plugins: 2/)).toBeInTheDocument();
    });

    it('renders children when provided', () => {
        const children = <div data-testid="test-children">Test Children</div>;
        render(createTestComponent({ children }));
        expect(screen.getByTestId('test-children')).toBeInTheDocument();
    });

    it('renders with default props', () => {
        render(createTestComponent());
        expect(screen.getByTestId('plugin-filter-component')).toBeInTheDocument();
    });
});
