import * as daoService from '@/shared/api/daoService';
import { generateDao, generateReactQueryResultSuccess } from '@/shared/testUtils';
import { render, screen } from '@testing-library/react';
import { DaoAssetsPageClient, type IDaoAssetsPageClientProps } from './daoAssetsPageClient';

jest.mock('@/modules/finance/components/financeDetailsList/financeDetailsList', () => ({
    FinanceDetailsList: jest.fn(() => <div data-testid="finance-details-list" />),
}));

jest.mock('@/modules/finance/components/assetList/assetList', () => ({
    AssetList: jest.fn(() => <div data-testid="asset-list" />),
}));

describe('<DaoAssetsPageClient /> component', () => {
    const useDaoSpy = jest.spyOn(daoService, 'useDao');

    beforeEach(() => {
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDao() }));
    });

    afterEach(() => {
        useDaoSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IDaoAssetsPageClientProps>) => {
        const completeProps: IDaoAssetsPageClientProps = {
            id: 'test-id',
            ...props,
        };

        return <DaoAssetsPageClient {...completeProps} />;
    };

    it('fetches the DAO with the provided id prop', () => {
        const id = 'new-test-id';
        render(createTestComponent({ id }));
        expect(useDaoSpy).toHaveBeenCalledWith({ urlParams: { id } });
    });

    it('renders the page title, Asset List, and Finance Details List', () => {
        render(createTestComponent());

        expect(screen.getByText(/daoAssetsPage.main.title/)).toBeInTheDocument();
        expect(screen.getByTestId('finance-details-list')).toBeInTheDocument();
        expect(screen.getByTestId('asset-list')).toBeInTheDocument();
    });
});
