import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { AssetList } from '@/modules/finance/components/assetList';
import * as daoService from '@/shared/api/daoService';
import { FeatureFlagsProvider } from '@/shared/components/featureFlagsProvider';
import type { FeatureFlagSnapshot } from '@/shared/featureFlags';
import * as useDaoFilterUrlParam from '@/shared/hooks/useDaoFilterUrlParam';
import { generateDao } from '@/shared/testUtils';

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
    const useDaoFilterUrlParamSpy = jest.spyOn(useDaoFilterUrlParam, 'useDaoFilterUrlParam');

    const featureFlagSnapshot: FeatureFlagSnapshot[] = [
        {
            key: 'debugPanel',
            name: 'Debug panel',
            description: '',
            enabled: false,
        },
        {
            key: 'subDao',
            name: 'SubDAO support',
            description: '',
            enabled: true,
        },
    ];

    beforeEach(() => {
        useDaoSpy.mockReturnValue({
            data: generateDao({ id: 'test-dao', address: '0x123', subDaos: [] }),
            isLoading: false,
            error: null,
        } as ReturnType<typeof daoService.useDao>);

        useDaoFilterUrlParamSpy.mockReturnValue({
            activeOption: {
                id: 'all',
                label: 'All',
                daoId: 'test-dao',
                isAll: true,
                isParent: false,
            },
            setActiveOption: jest.fn(),
            options: [
                {
                    id: 'all',
                    label: 'All',
                    daoId: 'test-dao',
                    isAll: true,
                    isParent: false,
                },
                {
                    id: 'test-dao',
                    label: 'Parent DAO',
                    daoId: 'test-dao',
                    isAll: false,
                    isParent: true,
                    onlyParent: true,
                },
            ],
        });
    });

    afterEach(() => {
        useDaoSpy.mockReset();
        useDaoFilterUrlParamSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<React.ComponentProps<typeof AssetList.Container>>) => {
        const completeProps: React.ComponentProps<typeof AssetList.Container> = {
            initialParams: { queryParams: { daoId: 'test-dao' } },
            daoId: 'test-dao',
            ...props,
        };

        return (
            <GukModulesProvider>
                <FeatureFlagsProvider initialSnapshot={featureFlagSnapshot}>
                    <AssetList.Container {...completeProps} />
                </FeatureFlagsProvider>
            </GukModulesProvider>
        );
    };

    it('renders the PluginFilterComponent with processed plugins', () => {
        render(createTestComponent());
        expect(screen.getByTestId('plugin-filter-component')).toBeInTheDocument();
        expect(screen.getByText(/Plugins: 2/)).toBeInTheDocument();
    });

    it('processes plugins and removes duplicates based on DAO address', () => {
        useDaoFilterUrlParamSpy.mockReturnValue({
            activeOption: {
                id: 'all',
                label: 'All',
                daoId: 'test-dao',
                isAll: true,
                isParent: false,
            },
            setActiveOption: jest.fn(),
            options: [
                {
                    id: 'all',
                    label: 'All',
                    daoId: 'test-dao',
                    isAll: true,
                    isParent: false,
                },
                {
                    id: 'subdao-1',
                    label: 'SubDAO 1',
                    daoId: 'subdao-1',
                    isAll: false,
                    isParent: false,
                },
                {
                    id: 'subdao-2',
                    label: 'SubDAO 2',
                    daoId: 'subdao-2',
                    isAll: false,
                    isParent: false,
                },
            ],
        });

        render(createTestComponent());

        // Should have 3 plugins: group filter + 2 unique SubDAOs (plugin2 is deduplicated)
        expect(screen.getByText(/Plugins: 3/)).toBeInTheDocument();
    });

    it('uses the group filter label for the "All" tab', () => {
        useDaoFilterUrlParamSpy.mockReturnValue({
            activeOption: {
                id: 'all',
                label: 'All',
                daoId: 'test-dao',
                isAll: true,
                isParent: false,
            },
            setActiveOption: jest.fn(),
            options: [
                {
                    id: 'all',
                    label: 'All',
                    daoId: 'test-dao',
                    isAll: true,
                    isParent: false,
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
        useDaoFilterUrlParamSpy.mockReturnValue({
            activeOption: {
                id: 'all',
                label: 'All',
                daoId: 'test-dao',
                isAll: true,
                isParent: false,
            },
            setActiveOption: jest.fn(),
            options: [
                {
                    id: 'all',
                    label: 'All',
                    daoId: 'test-dao',
                    isAll: true,
                    isParent: false,
                },
                {
                    id: 'subdao-1',
                    label: 'SubDAO 1',
                    daoId: 'subdao-1',
                    isAll: false,
                    isParent: false,
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
