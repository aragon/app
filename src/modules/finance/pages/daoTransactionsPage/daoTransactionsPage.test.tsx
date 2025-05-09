import { transactionListOptions } from '@/modules/finance/api/financeService/queries/useTransactionList/useTransactionList';
import { daoOptions, Network } from '@/shared/api/daoService';
import { generateDao, generateReactQueryResultSuccess } from '@/shared/testUtils';
import type * as ReactQuery from '@tanstack/react-query';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import * as WagmiActions from 'wagmi/actions';
import { daoTransactionsCount, DaoTransactionsPage, type IDaoTransactionsPageProps } from './daoTransactionsPage';

jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual<typeof ReactQuery>('@tanstack/react-query'),
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
    const getEnsAddressSpy = jest.spyOn(WagmiActions, 'getEnsAddress');

    beforeEach(() => {
        fetchQuerySpy.mockResolvedValue(generateReactQueryResultSuccess({ data: generateDao() }));
        prefetchInfiniteQuerySpy.mockImplementation(jest.fn());
        getEnsAddressSpy.mockResolvedValue('0x12345');
    });

    afterEach(() => {
        prefetchInfiniteQuerySpy.mockReset();
        fetchQuerySpy.mockReset();
        getEnsAddressSpy.mockReset();
    });

    const createTestComponent = async (props?: Partial<IDaoTransactionsPageProps>) => {
        const completeProps: IDaoTransactionsPageProps = {
            params: Promise.resolve({ addressOrEns: 'test.dao.eth', network: Network.ETHEREUM_MAINNET }),
            ...props,
        };

        const Component = await DaoTransactionsPage(completeProps);

        return Component;
    };

    it('renders the page client', async () => {
        render(await createTestComponent());
        expect(screen.getByTestId('page-client-mock')).toBeInTheDocument();
    });

    it('prefetches the DAO and its transaction list', async () => {
        const daoEns = 'test.dao.eth';
        const daoAddress = '0x12345';
        const daoNetwork = Network.ETHEREUM_MAINNET;
        const expectedDaoId = `${daoNetwork}-${daoAddress}`;
        const dao = generateDao({
            id: expectedDaoId,
            ens: daoEns,
            address: daoAddress,
        });
        const params = { addressOrEns: daoEns, network: daoNetwork };
        fetchQuerySpy.mockResolvedValue(dao);
        getEnsAddressSpy.mockResolvedValue(daoAddress);

        render(await createTestComponent({ params: Promise.resolve(params) }));
        expect(fetchQuerySpy.mock.calls[0][0].queryKey).toEqual(
            daoOptions({ urlParams: { id: expectedDaoId } }).queryKey,
        );

        const expectedParams = { address: dao.address, network: dao.network, pageSize: daoTransactionsCount };
        expect(prefetchInfiniteQuerySpy.mock.calls[0][0].queryKey).toEqual(
            transactionListOptions({ queryParams: expectedParams }).queryKey,
        );
    });
});
