import type * as ReactQuery from '@tanstack/react-query';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { notFound } from 'next/navigation-server';
import type { ReactNode } from 'react';
import { daoOverridesOptions } from '@/shared/api/cmsService';
import { daoOptions, Network } from '@/shared/api/daoService';
import {
    type ILayoutWorkspaceAccountProps,
    LayoutWorkspaceAccount,
} from './layoutWorkspaceAccount';

jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual<typeof ReactQuery>('@tanstack/react-query'),
    HydrationBoundary: (props: { children: ReactNode; state?: unknown }) => (
        <div data-testid="hydration-mock">{props.children}</div>
    ),
}));

jest.mock('next/navigation-server', () => ({
    notFound: jest.fn(() => {
        throw new Error('NEXT_HTTP_ERROR_FALLBACK;404');
    }),
}));

describe('<LayoutWorkspaceAccount /> component', () => {
    const address = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const accountId = `${Network.ETHEREUM_SEPOLIA}-${address}`;

    const notFoundMock = notFound as jest.MockedFunction<typeof notFound>;
    const fetchQuerySpy = jest.spyOn(QueryClient.prototype, 'fetchQuery');

    beforeEach(() => {
        fetchQuerySpy.mockResolvedValue({});
    });

    afterEach(() => {
        fetchQuerySpy.mockReset();
        notFoundMock.mockClear();
    });

    const createTestComponent = async (
        props?: Partial<ILayoutWorkspaceAccountProps>,
    ) => {
        const completeProps: ILayoutWorkspaceAccountProps = {
            params: Promise.resolve({ workspaceId: 'demo', accountId }),
            children: <div data-testid="page-mock" />,
            ...props,
        };

        return await LayoutWorkspaceAccount(completeProps);
    };

    // Query options carry a fresh queryFn per call, so the key is what identifies the read. `prefetchQuery`
    // passes its options straight to `fetchQuery`, which is what is spied here.
    const prefetchedKeys = () =>
        fetchQuerySpy.mock.calls.map(
            ([options]) => (options as { queryKey: unknown[] }).queryKey,
        );

    it('renders the page below it', async () => {
        render(await createTestComponent());

        expect(notFoundMock).not.toHaveBeenCalled();
        expect(screen.getByTestId('page-mock')).toBeInTheDocument();
    });

    // This is what the account scope buys: an account ID is a DAO ID, so the DAO resolves without the registry and
    // is hydrated once for every section below, which the workspace layout cannot do.
    it('prefetches the DAO of the account and the CMS overrides', async () => {
        await createTestComponent();

        expect(prefetchedKeys()).toContainEqual(
            daoOptions({ urlParams: { id: accountId } }).queryKey,
        );
        expect(prefetchedKeys()).toContainEqual(daoOverridesOptions().queryKey);
    });

    it('hydrates what it prefetched for the sections below', async () => {
        render(await createTestComponent());

        expect(screen.getByTestId('hydration-mock')).toBeInTheDocument();
    });

    it.each([
        { accountId: 'not-a-network-0x123', case: 'an unknown network' },
        {
            accountId: `${Network.ETHEREUM_SEPOLIA}-not-an-address`,
            case: 'a malformed address',
        },
    ])('renders the 404 page for $case', async ({ accountId }) => {
        await expect(
            createTestComponent({
                params: Promise.resolve({ workspaceId: 'demo', accountId }),
            }),
        ).rejects.toThrow('NEXT_HTTP_ERROR_FALLBACK;404');
        expect(fetchQuerySpy).not.toHaveBeenCalled();
    });

    // The backend accepts any casing, so a lowercase account on a shared link addresses the same pages.
    it('accepts an account whose address is not checksummed', async () => {
        render(
            await createTestComponent({
                params: Promise.resolve({
                    workspaceId: 'demo',
                    accountId: `${Network.ETHEREUM_SEPOLIA}-${address.toLowerCase()}`,
                }),
            }),
        );

        expect(notFoundMock).not.toHaveBeenCalled();
        expect(screen.getByTestId('page-mock')).toBeInTheDocument();
    });

    // A workspace holds Safe accounts too, and a Safe has no DAO to read. Prefetching rather than fetching is
    // what keeps that from failing the whole scope: the sections that need a DAO render their own not-found state.
    it('renders the page even when the account has no DAO', async () => {
        fetchQuerySpy.mockRejectedValue(new Error('not a DAO'));

        render(await createTestComponent());

        expect(screen.getByTestId('page-mock')).toBeInTheDocument();
    });
});
