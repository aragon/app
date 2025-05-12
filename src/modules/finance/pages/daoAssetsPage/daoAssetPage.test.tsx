import { assetListOptions } from '@/modules/finance/api/financeService';
import { daoOptions, Network } from '@/shared/api/daoService';
import { generateDao, generateReactQueryResultSuccess } from '@/shared/testUtils';
import { daoUtils } from '@/shared/utils/daoUtils';
import type * as ReactQuery from '@tanstack/react-query';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { daoAssetsCount, DaoAssetsPage, type IDaoAssetsPageProps } from './daoAssetsPage';

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
    const resolveDaoIdSpy = jest.spyOn(daoUtils, 'resolveDaoId');

    beforeEach(() => {
        fetchQuerySpy.mockResolvedValue(generateReactQueryResultSuccess({ data: generateDao() }));
        prefetchInfiniteQuerySpy.mockImplementation(jest.fn());
        resolveDaoIdSpy.mockResolvedValue('test-dao-id');
    });

    afterEach(() => {
        prefetchInfiniteQuerySpy.mockReset();
        fetchQuerySpy.mockReset();
        resolveDaoIdSpy.mockReset();
    });

    const createTestComponent = async (props?: Partial<IDaoAssetsPageProps>) => {
        const completeProps: IDaoAssetsPageProps = {
            params: Promise.resolve({ addressOrEns: 'test.dao.eth', network: Network.ETHEREUM_MAINNET }),
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
        const daoAddress = '0x12345';
        const dao = generateDao({ address: daoAddress });
        const expectedDaoId = 'test-dao-id';
        resolveDaoIdSpy.mockResolvedValue(expectedDaoId);
        fetchQuerySpy.mockResolvedValue(dao);

        render(await createTestComponent());
        expect(fetchQuerySpy.mock.calls[0][0].queryKey).toEqual(
            daoOptions({ urlParams: { id: expectedDaoId } }).queryKey,
        );

        const expectedParams = { address: dao.address, network: dao.network, pageSize: daoAssetsCount };
        expect(prefetchInfiniteQuerySpy.mock.calls[0][0].queryKey).toEqual(
            assetListOptions({ queryParams: expectedParams }).queryKey,
        );
    });
});
