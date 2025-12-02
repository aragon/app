import * as financeService from '@/modules/finance/api/financeService';
import * as daoService from '@/shared/api/daoService';
import * as useDaoPluginFilterUrlParam from '@/shared/hooks/useDaoPluginFilterUrlParam';
import {
    generateDao,
    generateDaoPlugin,
    generateFilterComponentPlugin,
    generateReactQueryResultSuccess,
    generateSubDao,
    ReactQueryWrapper,
} from '@/shared/testUtils';
import { render, screen } from '@testing-library/react';
import { DaoAssetsPageClient, type IDaoAssetsPageClientProps } from './daoAssetsPageClient';

jest.mock('@/modules/finance/components/assetList', () => ({
    AssetList: {
        Container: () => <div data-testid="asset-list" />,
    },
}));

jest.mock('@/modules/finance/components/financeDetailsList/financeDetailsList', () => ({
    FinanceDetailsList: jest.fn(() => <div data-testid="finance-details-list" />),
}));

jest.mock('@/modules/finance/components/assetListStats', () => ({
    AssetListStats: jest.fn(() => <div data-testid="asset-list-stats" />),
}));

describe('<DaoAssetsPageClient /> component', () => {
    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const useDaoPluginFilterUrlParamSpy = jest.spyOn(useDaoPluginFilterUrlParam, 'useDaoPluginFilterUrlParam');
    const useAssetListSpy = jest.spyOn(financeService, 'useAssetList');

    const allAssetsPlugin = generateFilterComponentPlugin({
        id: 'all',
        uniqueId: 'all',
        label: 'All assets',
        meta: generateDaoPlugin({ isBody: true }),
    });

    beforeEach(() => {
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDao({ subDaos: [] }) }));
        useDaoPluginFilterUrlParamSpy.mockReturnValue({
            activePlugin: allAssetsPlugin,
            setActivePlugin: jest.fn(),
            plugins: [allAssetsPlugin],
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
        useDaoPluginFilterUrlParamSpy.mockReset();
        useAssetListSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IDaoAssetsPageClientProps>) => {
        const completeProps: IDaoAssetsPageClientProps = {
            id: 'test-id',
            initialParams: { queryParams: {} },
            ...props,
        };

        return <DaoAssetsPageClient {...completeProps} />;
    };

    it('fetches the DAO with the provided id prop', () => {
        const id = 'new-test-id';
        render(createTestComponent({ id }), { wrapper: ReactQueryWrapper });
        expect(useDaoSpy).toHaveBeenCalledWith({ urlParams: { id } });
    });

    it('renders FinanceDetailsList only when DAO has no SubDAOs', () => {
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDao({ subDaos: [] }) }));
        render(createTestComponent(), { wrapper: ReactQueryWrapper });

        expect(screen.getByText(/daoAssetsPage.main.title/)).toBeInTheDocument();
        expect(screen.getByTestId('asset-list')).toBeInTheDocument();
        expect(screen.getByTestId('finance-details-list')).toBeInTheDocument();
        expect(screen.queryByTestId('asset-list-stats')).not.toBeInTheDocument();
    });

    it('renders Asset List Stats only when "All" tab is selected and DAO has SubDAOs', () => {
        const subDaos = [generateSubDao({ address: '0x123' }), generateSubDao({ address: '0x456' })];
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDao({ subDaos }) }));
        useDaoPluginFilterUrlParamSpy.mockReturnValue({
            activePlugin: allAssetsPlugin,
            setActivePlugin: jest.fn(),
            plugins: [allAssetsPlugin],
        });
        render(createTestComponent(), { wrapper: ReactQueryWrapper });

        expect(screen.getByText(/daoAssetsPage.main.title/)).toBeInTheDocument();
        expect(screen.getByTestId('asset-list')).toBeInTheDocument();
        expect(screen.getByTestId('asset-list-stats')).toBeInTheDocument();
        expect(screen.queryByTestId('finance-details-list')).not.toBeInTheDocument();
    });

    it('renders FinanceDetailsList when a specific SubDAO tab is selected', () => {
        const subDaos = [generateSubDao({ address: '0x123' }), generateSubDao({ address: '0x456' })];
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDao({ subDaos }) }));
        const selectedPlugin = generateFilterComponentPlugin({
            id: 'plugin',
            uniqueId: 'plugin-1',
            label: 'Treasury',
            meta: generateDaoPlugin({ address: '0x123', daoAddress: '0x123', isBody: true }),
        });
        useDaoPluginFilterUrlParamSpy.mockReturnValueOnce({
            activePlugin: selectedPlugin,
            setActivePlugin: jest.fn(),
            plugins: [selectedPlugin],
        });
        render(createTestComponent(), { wrapper: ReactQueryWrapper });

        expect(screen.getByText(/daoAssetsPage.main.title/)).toBeInTheDocument();
        expect(screen.getByTestId('asset-list')).toBeInTheDocument();
        expect(screen.getByTestId('finance-details-list')).toBeInTheDocument();
        expect(screen.queryByTestId('asset-list-stats')).not.toBeInTheDocument();
    });
});
