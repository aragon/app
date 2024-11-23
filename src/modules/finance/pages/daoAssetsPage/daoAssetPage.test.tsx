import { assetListOptions } from '@/modules/finance/api/financeService';
import { daoOptions } from '@/shared/api/daoService';
import { generateDao, generateReactQueryResultSuccess } from '@/shared/testUtils';
import type * as ReactQuery from '@tanstack/react-query';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { DaoAssetsPage, daoAssetsCount, type IDaoAssetsPageProps } from './daoAssetsPage';

jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual<typeof ReactQuery>('@tanstack/react-query'),
    HydrationBoundary: (props: { children: ReactNode; state?: unknown }) => (
        <div data-testid="hydration-mock" data-state={JSON.stringify(props.state)}>
            {props.children}
        </div>
    ),
}));

jest.mock('./daoAssetsPageClient', () => ({
    DaoAssetsPageClient: () => <div data-testid="page-client-mock" />,
}));

describe('<DaoAssetsPage /> component', () => {
    const prefetchInfiniteQuerySpy = jest.spyOn(QueryClient.prototype, 'prefetchInfiniteQuery');
    const fetchQuerySpy = jest.spyOn(QueryClient.prototype, 'fetchQuery');

    beforeEach(() => {
        fetchQuerySpy.mockResolvedValue(generateReactQueryResultSuccess({ data: generateDao() }));
        prefetchInfiniteQuerySpy.mockImplementation(jest.fn());
    });

    afterEach(() => {
        prefetchInfiniteQuerySpy.mockReset();
        fetchQuerySpy.mockReset();
    });

    const createTestComponent = async (props?: Partial<IDaoAssetsPageProps>) => {
        const completeProps: IDaoAssetsPageProps = {
            params: Promise.resolve({ id: 'test-slug' }),
            ...props,
        };

        const Component = await DaoAssetsPage(completeProps);

        return Component;
    };

    it('renders the page client', async () => {
        render(await createTestComponent());
        expect(screen.getByTestId('page-client-mock')).toBeInTheDocument();
    });

    it('prefetches the DAO and its asset list', async () => {
        const id = 'another-test-slug';
        const params = { id };
        const dao = generateDao({ id });
        fetchQuerySpy.mockResolvedValue(dao);

        render(await createTestComponent({ params: Promise.resolve(params) }));
        expect(fetchQuerySpy.mock.calls[0][0].queryKey).toEqual(daoOptions({ urlParams: params }).queryKey);

        const expectedParams = { address: dao.address, network: dao.network, pageSize: daoAssetsCount };
        expect(prefetchInfiniteQuerySpy.mock.calls[0][0].queryKey).toEqual(
            assetListOptions({ queryParams: expectedParams }).queryKey,
        );
    });
});
