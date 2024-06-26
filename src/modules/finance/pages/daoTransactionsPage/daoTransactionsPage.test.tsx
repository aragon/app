import { transactionListOptions } from '@/modules/finance/api/financeService/queries/useTransactionList';
import { daoOptions } from '@/shared/api/daoService';
import { generateDao } from '@/shared/testUtils';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import { DaoTransactionsPage, type IDaoTransactionsPageProps } from './daoTransactionsPage';

jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual('@tanstack/react-query'),
    HydrationBoundary: (props: { children: ReactNode; state?: unknown }) => (
        <div data-testid="hydration-mock" data-state={JSON.stringify(props.state)}>
            {props.children}
        </div>
    ),
}));

jest.mock('./daoTransactionsPageClient', () => ({
    DaoTransactionsPageClient: () => <div data-testid="page-client-mock" />,
}));

describe('<DaoTransactionsPage /> component', () => {
    const prefetchInfiniteQuerySpy = jest.spyOn(QueryClient.prototype, 'prefetchInfiniteQuery');
    const fetchQuerySpy = jest.spyOn(QueryClient.prototype, 'fetchQuery');

    beforeEach(() => {
        prefetchInfiniteQuerySpy.mockImplementation(jest.fn());
        fetchQuerySpy.mockImplementation(jest.fn());
    });

    afterEach(() => {
        prefetchInfiniteQuerySpy.mockReset();
        fetchQuerySpy.mockReset();
    });

    const createTestComponent = async (props?: Partial<IDaoTransactionsPageProps>) => {
        const completeProps: IDaoTransactionsPageProps = { params: { id: 'test-slug' }, ...props };
        const Component = await DaoTransactionsPage(completeProps);

        return Component;
    };

    it('renders the DaoTransactionsPageClient', async () => {
        render(await createTestComponent());

        expect(screen.getByTestId('page-client-mock')).toBeInTheDocument();
    });

    it('prefetches the DAO and the Transaction List', async () => {
        const id = 'another-test-slug';
        const params = { id };
        const dao = generateDao({ id });
        fetchQuerySpy.mockResolvedValue(dao);

        render(await createTestComponent({ params }));
        expect(fetchQuerySpy.mock.calls[0][0].queryKey).toEqual(daoOptions({ urlParams: params }).queryKey);

        expect(prefetchInfiniteQuerySpy.mock.calls[0][0].queryKey).toEqual(
            transactionListOptions({ queryParams: { address: dao.address, network: dao.network } }).queryKey,
        );
    });
});
