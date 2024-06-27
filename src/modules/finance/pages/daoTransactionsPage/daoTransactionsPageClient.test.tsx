import * as daoService from '@/shared/api/daoService';
import { generateDao, generateReactQueryResultSuccess } from '@/shared/testUtils';
import { render, screen } from '@testing-library/react';
import { DaoTransactionsPageClient, type IDaoTransactionsPageClientProps } from './daoTransactionsPageClient';

jest.mock('@/modules/finance/components/financeDetailsList/financeDetailsList', () => ({
    FinanceDetailsList: jest.fn(() => <div data-testid="finance-details-list" />),
}));

jest.mock('@/modules/finance/components/transactionList/transactionList', () => ({
    TransactionList: jest.fn(() => <div data-testid="finance-transactions-list" />),
}));

describe('<DaoTransactionsPageClient /> component', () => {
    const useDaoSpy = jest.spyOn(daoService, 'useDao');

    beforeEach(() => {
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDao() }));
    });

    afterEach(() => {
        useDaoSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IDaoTransactionsPageClientProps>) => {
        const completeProps: IDaoTransactionsPageClientProps = {
            id: 'test-id',
            initialParams: { queryParams: {} },
            ...props,
        };

        return <DaoTransactionsPageClient {...completeProps} />;
    };

    it('fetches the DAO with the provided id prop', () => {
        const id = 'new-test-id';
        render(createTestComponent({ id }));
        expect(useDaoSpy).toHaveBeenCalledWith({ urlParams: { id } });
    });

    it('renders the page title, Transactions List and Transaction Page details', () => {
        render(createTestComponent());

        expect(screen.getByText(/daoTransactionsPage.main.title/)).toBeInTheDocument();
        expect(screen.getByTestId('finance-details-list')).toBeInTheDocument();
        expect(screen.getByTestId('finance-transactions-list')).toBeInTheDocument();
    });
});
