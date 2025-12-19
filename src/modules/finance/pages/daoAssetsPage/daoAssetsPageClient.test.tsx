import { render, screen } from '@testing-library/react';
import * as financeService from '@/modules/finance/api/financeService';
import * as daoService from '@/shared/api/daoService';
import { FeatureFlagsProvider } from '@/shared/components/featureFlagsProvider';
import type { FeatureFlagSnapshot } from '@/shared/featureFlags';
import * as useDaoFilterUrlParam from '@/shared/hooks/useDaoFilterUrlParam';
import {
    generateDao,
    generateReactQueryResultSuccess,
    generateSubDao,
    ReactQueryWrapper,
} from '@/shared/testUtils';
import {
    DaoAssetsPageClient,
    type IDaoAssetsPageClientProps,
} from './daoAssetsPageClient';

jest.mock('@/modules/finance/components/assetList', () => ({
    AssetList: {
        Container: () => <div data-testid="asset-list" />,
    },
}));

jest.mock('@/modules/finance/components/allAssetsStats', () => ({
    AllAssetsStats: jest.fn(() => <div data-testid="all-assets-stats" />),
}));

jest.mock('@/modules/finance/components/daoInfoAside', () => ({
    DaoInfoAside: jest.fn(() => <div data-testid="dao-info-aside" />),
}));

describe('<DaoAssetsPageClient /> component', () => {
    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const useDaoFilterUrlParamSpy = jest.spyOn(
        useDaoFilterUrlParam,
        'useDaoFilterUrlParam',
    );
    const useAssetListSpy = jest.spyOn(financeService, 'useAssetList');

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
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({
                data: generateDao({ subDaos: [] }),
            }),
        );
        useDaoFilterUrlParamSpy.mockReturnValue({
            activeOption: {
                id: 'all',
                label: 'All assets',
                daoId: 'test-id',
                isAll: true,
                isParent: false,
            },
            setActiveOption: jest.fn(),
            options: [
                {
                    id: 'all',
                    label: 'All assets',
                    daoId: 'test-id',
                    isAll: true,
                    isParent: false,
                },
                {
                    id: 'test-id',
                    label: 'Parent DAO',
                    daoId: 'test-id',
                    isAll: false,
                    isParent: true,
                    onlyParent: true,
                },
            ],
        });
        useAssetListSpy.mockReturnValue({
            data: undefined,
            status: 'success',
            fetchStatus: 'idle',
            isFetchingNextPage: false,
            fetchNextPage: jest.fn(),
        } as unknown as ReturnType<typeof financeService.useAssetList>);
    });

    afterEach(() => {
        useDaoSpy.mockReset();
        useDaoFilterUrlParamSpy.mockReset();
        useAssetListSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<IDaoAssetsPageClientProps>,
    ) => {
        const completeProps: IDaoAssetsPageClientProps = {
            id: 'test-id',
            initialParams: { queryParams: { daoId: 'test-id' } },
            ...props,
        };

        return (
            <FeatureFlagsProvider initialSnapshot={featureFlagSnapshot}>
                <DaoAssetsPageClient {...completeProps} />
            </FeatureFlagsProvider>
        );
    };

    it('fetches the DAO with the provided id prop', () => {
        const id = 'new-test-id';
        render(createTestComponent({ id }), { wrapper: ReactQueryWrapper });
        expect(useDaoSpy).toHaveBeenCalledWith(
            expect.objectContaining({ urlParams: { id } }),
        );
    });

    it('renders AllAssetsStats when "All" tab is selected', () => {
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({
                data: generateDao({ subDaos: [] }),
            }),
        );
        render(createTestComponent(), { wrapper: ReactQueryWrapper });

        expect(
            screen.getByText(/daoAssetsPage.main.title/),
        ).toBeInTheDocument();
        expect(screen.getByTestId('asset-list')).toBeInTheDocument();
        expect(screen.getByTestId('all-assets-stats')).toBeInTheDocument();
        expect(screen.queryByTestId('dao-info-aside')).not.toBeInTheDocument();
    });

    it('renders AllAssetsStats only when "All" tab is selected and DAO has SubDAOs', () => {
        const subDaos = [
            generateSubDao({ address: '0x123' }),
            generateSubDao({ address: '0x456' }),
        ];
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: generateDao({ subDaos }) }),
        );
        useDaoFilterUrlParamSpy.mockReturnValue({
            activeOption: {
                id: 'all',
                label: 'All assets',
                daoId: 'test-id',
                isAll: true,
                isParent: false,
            },
            setActiveOption: jest.fn(),
            options: [
                {
                    id: 'all',
                    label: 'All assets',
                    daoId: 'test-id',
                    isAll: true,
                    isParent: false,
                },
                {
                    id: 'test-id',
                    label: 'Parent DAO',
                    daoId: 'test-id',
                    isAll: false,
                    isParent: true,
                    onlyParent: true,
                },
                {
                    id: subDaos[0].id,
                    label: subDaos[0].name,
                    daoId: subDaos[0].id,
                    isAll: false,
                    isParent: false,
                },
                {
                    id: subDaos[1].id,
                    label: subDaos[1].name,
                    daoId: subDaos[1].id,
                    isAll: false,
                    isParent: false,
                },
            ],
        });
        render(createTestComponent(), { wrapper: ReactQueryWrapper });

        expect(
            screen.getByText(/daoAssetsPage.main.title/),
        ).toBeInTheDocument();
        expect(screen.getByTestId('asset-list')).toBeInTheDocument();
        expect(screen.getByTestId('all-assets-stats')).toBeInTheDocument();
        expect(
            screen.queryByTestId('finance-details-list'),
        ).not.toBeInTheDocument();
    });

    it('renders DaoInfoAside when a specific SubDAO tab is selected', () => {
        const subDaos = [
            generateSubDao({ address: '0x123' }),
            generateSubDao({ address: '0x456' }),
        ];
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: generateDao({ subDaos }) }),
        );
        const selectedOption = {
            id: subDaos[0].id,
            label: subDaos[0].name,
            daoId: subDaos[0].id,
            isAll: false,
            isParent: false,
        };
        useDaoFilterUrlParamSpy.mockReturnValue({
            activeOption: selectedOption,
            setActiveOption: jest.fn(),
            options: [
                {
                    id: 'all',
                    label: 'All assets',
                    daoId: 'test-id',
                    isAll: true,
                    isParent: false,
                },
                selectedOption,
            ],
        });
        render(createTestComponent(), { wrapper: ReactQueryWrapper });

        expect(
            screen.getByText(/daoAssetsPage.main.title/),
        ).toBeInTheDocument();
        expect(screen.getByTestId('asset-list')).toBeInTheDocument();
        expect(screen.getByTestId('dao-info-aside')).toBeInTheDocument();
        expect(
            screen.queryByTestId('all-assets-stats'),
        ).not.toBeInTheDocument();
    });
});
