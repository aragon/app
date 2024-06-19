import { transactionListOptions } from '@/modules/finance/api/financeService/queries/useTransactionList';
import { render, screen } from '@testing-library/react';
import { DaoTransactionsPage, type IDaoTransactionsPageProps } from './daoTransactionsPage';
import { DaoTransactionsPageClient } from './daoTransactionsPageClient';

jest.mock('@/shared/components/page', () => ({
    Page: {
        Container: (props: { children: React.ReactNode }) => <div data-testid="page-container">{props.children}</div>,
    },
}));

jest.mock('./daoTransactionsPageClient', () => ({
    DaoTransactionsPageClient: jest.fn(() => <div>Mocked DaoTransactionsPageClient</div>),
}));

const mockPrefetchInfiniteQuery = jest.fn();

jest.mock('@tanstack/react-query', () => {
    const originalModule = jest.requireActual('@tanstack/react-query');
    return {
        ...originalModule,
        QueryClient: jest.fn(() => ({
            prefetchInfiniteQuery: mockPrefetchInfiniteQuery.mockResolvedValue({}),
        })),
        QueryClientProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    };
});

jest.mock('@/modules/finance/api/financeService/queries/useTransactionList', () => ({
    transactionListOptions: jest.fn(() => ({})),
}));

describe('<DaoTransactionsPage /> component', () => {
    const createTestComponent = async (props?: Partial<IDaoTransactionsPageProps>) => {
        const completeProps: IDaoTransactionsPageProps = { params: { id: 'test-slug' }, ...props };
        const Component = await DaoTransactionsPage(completeProps);

        return Component;
    };

    it('renders the DaoTransactionsPage with a specific id', async () => {
        const id = 'new-test-slug';
        const params = { id };
        const Component = await createTestComponent({ params });
        render(Component);
        expect(DaoTransactionsPageClient).toHaveBeenCalledWith({ id }, {});
        expect(screen.getByText('Mocked DaoTransactionsPageClient')).toBeInTheDocument();
    });

    it('prefetches the transaction list', async () => {
        const id = 'another-test-slug';
        const params = { id };
        await createTestComponent({ params });
        expect(mockPrefetchInfiniteQuery).toHaveBeenCalledWith(transactionListOptions({ queryParams: {} }));
    });
});
