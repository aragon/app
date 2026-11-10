import type * as ReactQuery from '@tanstack/react-query';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { notFound } from 'next/navigation-server';
import type { ReactNode } from 'react';
import { WorkspaceAccountType } from '@/modules/workspace/api/workspaceService';
import * as workspaceExternalAccountBannerModule from '@/modules/workspace/components/workspaceExternalAccountBanner';
import { workspaceAccountInfoUtils } from '@/modules/workspace/utils/workspaceAccountInfoUtils';
import { daoOverridesOptions } from '@/shared/api/cmsService';
import { daoOptions, Network } from '@/shared/api/daoService';
import { featureFlags } from '@/shared/featureFlags';
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
    const isEnabledSpy = jest.spyOn(featureFlags, 'isEnabled');
    const resolveAccountTypeSpy = jest.spyOn(
        workspaceAccountInfoUtils,
        'resolveAccountType',
    );
    // Stubbed: the banner reads the workspace on the client, which belongs to its own tests.
    const externalAccountBannerSpy = jest.spyOn(
        workspaceExternalAccountBannerModule,
        'WorkspaceExternalAccountBanner',
    );

    beforeEach(() => {
        fetchQuerySpy.mockResolvedValue({});
        isEnabledSpy.mockResolvedValue(true);
        resolveAccountTypeSpy.mockResolvedValue(WorkspaceAccountType.DAO);
        externalAccountBannerSpy.mockImplementation(() => null);
    });

    afterEach(() => {
        fetchQuerySpy.mockReset();
        isEnabledSpy.mockReset();
        resolveAccountTypeSpy.mockReset();
        externalAccountBannerSpy.mockReset();
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

    // Query options carry a fresh queryFn per call, so the key is what identifies the read.
    const prefetchedKeys = () =>
        fetchQuerySpy.mock.calls.map(
            ([options]) => (options as { queryKey: unknown[] }).queryKey,
        );

    // Nested layouts render in parallel, so the 404 of `LayoutWorkspace` above does not stop this one from running.
    it('renders the 404 page without requesting the DAO when the workspaces flag is disabled', async () => {
        isEnabledSpy.mockResolvedValue(false);

        await expect(createTestComponent()).rejects.toThrow(
            'NEXT_HTTP_ERROR_FALLBACK;404',
        );
        expect(isEnabledSpy).toHaveBeenCalledWith('workspaces');
        expect(fetchQuerySpy).not.toHaveBeenCalled();
    });

    it('renders the page below it', async () => {
        render(await createTestComponent());

        expect(notFoundMock).not.toHaveBeenCalled();
        expect(screen.getByTestId('page-mock')).toBeInTheDocument();
    });

    // This is what the account scope buys: an account ID is a DAO ID, so the DAO resolves without the registry and
    // is hydrated once for every section below, which the workspace layout cannot do.
    it('prefetches the DAO of the account', async () => {
        await createTestComponent();

        expect(prefetchedKeys()).toContainEqual(
            daoOptions({ urlParams: { id: accountId } }).queryKey,
        );
    });

    // `LayoutWorkspace`, which this layout always renders inside, has already read them — reading them again would
    // be the same read twice in one render.
    it('leaves the CMS overrides to the workspace layout above it', async () => {
        await createTestComponent();

        expect(prefetchedKeys()).not.toContainEqual(
            daoOverridesOptions().queryKey,
        );
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

    // A Safe has no DAO to read, so the failed DAO read must not fail its route.
    it('renders the page of a Safe, whose DAO read fails', async () => {
        resolveAccountTypeSpy.mockResolvedValue(WorkspaceAccountType.SAFE);
        fetchQuerySpy.mockRejectedValue(new Error('not a DAO'));

        render(await createTestComponent());

        expect(screen.getByTestId('page-mock')).toBeInTheDocument();
    });

    // The DAO pages render nothing without their DAO, so a DAO whose record cannot be read fails the route instead.
    it('fails the route of a DAO whose DAO read fails', async () => {
        resolveAccountTypeSpy.mockResolvedValue(WorkspaceAccountType.DAO);
        fetchQuerySpy.mockRejectedValue(new Error('backend down'));

        await expect(createTestComponent()).rejects.toThrow(
            'the DAO of the account could not be read',
        );
    });

    it('renders the banner of an account the workspace does not hold above the page', async () => {
        render(await createTestComponent());

        expect(externalAccountBannerSpy).toHaveBeenCalled();
    });

    // Bots probe account-addressed URLs; a URL failing before the lookup must not cost one.
    it('sends no account lookup when the workspaces flag is disabled', async () => {
        isEnabledSpy.mockResolvedValue(false);

        await expect(createTestComponent()).rejects.toThrow(
            'NEXT_HTTP_ERROR_FALLBACK;404',
        );
        expect(resolveAccountTypeSpy).not.toHaveBeenCalled();
    });

    it.each([
        { accountId: 'not-a-network-0x123', case: 'an unknown network' },
        {
            accountId: `${Network.ETHEREUM_SEPOLIA}-not-an-address`,
            case: 'a malformed address',
        },
    ])('sends no account lookup for $case', async ({ accountId }) => {
        await expect(
            createTestComponent({
                params: Promise.resolve({ workspaceId: 'demo', accountId }),
            }),
        ).rejects.toThrow('NEXT_HTTP_ERROR_FALLBACK;404');
        expect(resolveAccountTypeSpy).not.toHaveBeenCalled();
    });

    it('looks up the type of the account of the route', async () => {
        await createTestComponent();

        expect(resolveAccountTypeSpy).toHaveBeenCalledWith(accountId);
    });

    it.each([WorkspaceAccountType.DAO, WorkspaceAccountType.SAFE])(
        'renders the page of a %s',
        async (accountType) => {
            resolveAccountTypeSpy.mockResolvedValue(accountType);

            render(await createTestComponent());

            expect(screen.getByTestId('page-mock')).toBeInTheDocument();
        },
    );

    // The lookup fails the route itself — `notFound()` for an unknown address, an error for one it cannot place — and
    // the layout lets that through to the boundaries above it.
    it.each([
        'NEXT_HTTP_ERROR_FALLBACK;404',
        'the account could not be verified',
    ])('fails the route when the lookup does (%s)', async (message) => {
        resolveAccountTypeSpy.mockRejectedValue(new Error(message));

        await expect(createTestComponent()).rejects.toThrow(message);
        expect(screen.queryByTestId('page-mock')).not.toBeInTheDocument();
    });
});
