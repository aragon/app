import * as daoService from '@/shared/api/daoService';
import * as useDaoPlugins from '@/shared/hooks/useDaoPlugins';
import {
    generateDao,
    generateDaoPlugin,
    generateFilterComponentPlugin,
    generateReactQueryResultSuccess,
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

jest.mock('@/modules/finance/components/subDaoInfo', () => ({
    SubDaoInfo: jest.fn(() => <div data-testid="subdao-info" />),
}));

describe('<DaoAssetsPageClient /> component', () => {
    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const useDaoPluginsSpy = jest.spyOn(useDaoPlugins, 'useDaoPlugins');

    beforeEach(() => {
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDao() }));
        useDaoPluginsSpy.mockReturnValue([
            generateFilterComponentPlugin({ uniqueId: 'all', meta: generateDaoPlugin() }),
        ]);
    });

    afterEach(() => {
        useDaoSpy.mockReset();
        useDaoPluginsSpy.mockReset();
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
        render(createTestComponent({ id }));
        expect(useDaoSpy).toHaveBeenCalledWith({ urlParams: { id } });
    });

    it('renders the page title, Asset List, Asset List Stats, and Finance Details List when "All" tab is selected', () => {
        useDaoPluginsSpy.mockReturnValue([
            generateFilterComponentPlugin({ uniqueId: 'all', meta: generateDaoPlugin() }),
        ]);
        render(createTestComponent());

        expect(screen.getByText(/daoAssetsPage.main.title/)).toBeInTheDocument();
        expect(screen.getByTestId('asset-list')).toBeInTheDocument();
        expect(screen.getByTestId('asset-list-stats')).toBeInTheDocument();
        expect(screen.getByTestId('finance-details-list')).toBeInTheDocument();
    });

    it('renders the page title, Asset List, and SubDao Info when a specific SubDAO tab is selected', () => {
        useDaoPluginsSpy.mockReturnValue([
            generateFilterComponentPlugin({ uniqueId: 'subdao-123', meta: generateDaoPlugin() }),
        ]);
        render(createTestComponent());

        expect(screen.getByText(/daoAssetsPage.main.title/)).toBeInTheDocument();
        expect(screen.getByTestId('asset-list')).toBeInTheDocument();
        expect(screen.getByTestId('subdao-info')).toBeInTheDocument();
        expect(screen.queryByTestId('asset-list-stats')).not.toBeInTheDocument();
        expect(screen.queryByTestId('finance-details-list')).not.toBeInTheDocument();
    });
});
