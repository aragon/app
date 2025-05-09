import { daoOptions, Network } from '@/shared/api/daoService';
import { testLogger } from '@/test/utils';
import type * as ReactQuery from '@tanstack/react-query';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import * as WagmiActions from 'wagmi/actions';
import { LayoutDao, type ILayoutDaoProps } from './layoutDao';

jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual<typeof ReactQuery>('@tanstack/react-query'),
    HydrationBoundary: (props: { children: ReactNode; state?: unknown }) => (
        <div data-testid="hydration-mock" data-state={JSON.stringify(props.state)}>
            {props.children}
        </div>
    ),
}));

jest.mock('../../navigations/navigationDao', () => ({
    NavigationDao: () => <div data-testid="navigation-dao-mock" />,
}));

jest.mock('../../bannerDao', () => ({ BannerDao: () => <div data-testid="banner-mock" /> }));

describe('<LayoutDao /> component', () => {
    const fetchQuerySpy = jest.spyOn(QueryClient.prototype, 'fetchQuery');
    const consoleErrorSpy = jest.spyOn(console, 'error');
    const getEnsAddressSpy = jest.spyOn(WagmiActions, 'getEnsAddress');

    beforeEach(() => {
        consoleErrorSpy.mockImplementation(jest.fn());
        fetchQuerySpy.mockImplementation(jest.fn());
        getEnsAddressSpy.mockResolvedValue('0x12345');
    });

    afterEach(() => {
        fetchQuerySpy.mockReset();
        consoleErrorSpy.mockReset();
        getEnsAddressSpy.mockReset();
    });

    const createTestComponent = async (props?: Partial<ILayoutDaoProps>) => {
        const completeProps: ILayoutDaoProps = {
            params: Promise.resolve({ addressOrEns: 'test.dao.eth', network: Network.ETHEREUM_MAINNET }),
            ...props,
        };

        const Component = await LayoutDao(completeProps);
        return Component;
    };

    it('renders the navigation DAO component and children property', async () => {
        const children = 'test-children';
        render(await createTestComponent({ children }));
        expect(screen.getByTestId('navigation-dao-mock')).toBeInTheDocument();
        expect(screen.getByText(children)).toBeInTheDocument();
    });

    it('prefetches the DAO from the given slug', async () => {
        const daoEns = 'test.dao.eth';
        const daoAddress = '0x12345';
        const daoNetwork = Network.ETHEREUM_MAINNET;
        const expectedDaoId = `${daoNetwork}-${daoAddress}`;
        const params = { addressOrEns: daoEns, network: daoNetwork };

        render(await createTestComponent({ params: Promise.resolve(params) }));
        expect(fetchQuerySpy.mock.calls[0][0].queryKey).toEqual(
            daoOptions({ urlParams: { id: expectedDaoId } }).queryKey,
        );
    });

    it('dehydrates the query client state', async () => {
        render(await createTestComponent());
        expect(screen.getByTestId('hydration-mock')).toBeInTheDocument();
    });

    it('displays an error feedback but displays the DAO navigation if an error is thrown by a children component', async () => {
        testLogger.suppressErrors();
        const Children = () => {
            throw new Error('Test error');
        };

        render(await createTestComponent({ children: <Children /> }));
        expect(screen.getByTestId('navigation-dao-mock')).toBeInTheDocument();
        expect(screen.getByText(/errorFeedback.title/)).toBeInTheDocument();
    });

    it('renders error with a link to explore page on fetch DAO error', async () => {
        const params = { addressOrEns: 'test.dao.eth', network: Network.ETHEREUM_MAINNET };
        fetchQuerySpy.mockRejectedValue('error');

        render(await createTestComponent({ params: Promise.resolve(params) }));
        const errorLink = screen.getByRole('link', { name: /layoutDao.notFound.action/ });
        expect(errorLink).toBeInTheDocument();
        expect(errorLink.getAttribute('href')).toEqual(`/`);
    });
});
