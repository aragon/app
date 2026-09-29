import type * as ReactQuery from '@tanstack/react-query';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
// The `next/navigation` alias points to the client-hooks wrapper, which cannot re-export server functions.
import { notFound } from 'next/navigation-original';
import type { ReactNode } from 'react';
import {
    proposalActionsOptions,
    proposalBySlugOptions,
} from '@/modules/governance/api/governanceService';
import { daoOverridesOptions } from '@/shared/api/cmsService';
import { daoOptions, Network } from '@/shared/api/daoService';
import { featureFlags } from '@/shared/featureFlags';
import { daoUtils } from '@/shared/utils/daoUtils';
import {
    type IWorkspaceProposalDetailsPageProps,
    WorkspaceProposalDetailsPage,
} from './workspaceProposalDetailsPage';

jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual<typeof ReactQuery>('@tanstack/react-query'),
    HydrationBoundary: (props: { children: ReactNode; state?: unknown }) => (
        <div data-testid="hydration-mock">{props.children}</div>
    ),
}));

jest.mock('next/navigation-original', () => ({
    notFound: jest.fn(() => {
        throw new Error('NEXT_HTTP_ERROR_FALLBACK;404');
    }),
}));

jest.mock('./workspaceProposalDetailsPageClient', () => ({
    WorkspaceProposalDetailsPageClient: () => (
        <div data-testid="page-client-mock" />
    ),
}));

describe('<WorkspaceProposalDetailsPage /> component', () => {
    const address = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const accountId = `${Network.ETHEREUM_SEPOLIA}-${address}`;

    const notFoundMock = notFound as jest.MockedFunction<typeof notFound>;
    const isEnabledSpy = jest.spyOn(featureFlags, 'isEnabled');
    const querySpy = jest.spyOn(QueryClient.prototype, 'query');
    const resolveDaoIdSpy = jest.spyOn(daoUtils, 'resolveDaoId');

    beforeEach(() => {
        isEnabledSpy.mockResolvedValue(true);
        querySpy.mockResolvedValue({ id: 'proposal-id' });
    });

    afterEach(() => {
        isEnabledSpy.mockReset();
        querySpy.mockReset();
        resolveDaoIdSpy.mockReset();
        notFoundMock.mockClear();
    });

    const createTestComponent = async (
        props?: Partial<IWorkspaceProposalDetailsPageProps>,
    ) => {
        const completeProps: IWorkspaceProposalDetailsPageProps = {
            params: Promise.resolve({
                workspaceId: 'demo',
                accountId,
                proposalSlug: 'MULTISIG-3',
            }),
            ...props,
        };

        return await WorkspaceProposalDetailsPage(completeProps);
    };

    it('renders the proposal details when the workspaces feature is enabled', async () => {
        render(await createTestComponent());

        expect(isEnabledSpy).toHaveBeenCalledWith('workspaces');
        expect(notFoundMock).not.toHaveBeenCalled();
        expect(screen.getByTestId('page-client-mock')).toBeInTheDocument();
    });

    it('renders the 404 page when the workspaces feature is disabled', async () => {
        isEnabledSpy.mockResolvedValue(false);

        await expect(createTestComponent()).rejects.toThrow(
            'NEXT_HTTP_ERROR_FALLBACK;404',
        );
        expect(querySpy).not.toHaveBeenCalled();
    });

    // Query options carry a fresh queryFn per call, so the key is what identifies the read.
    const queriedKeys = () =>
        querySpy.mock.calls.map(
            ([options]) => (options as { queryKey: unknown[] }).queryKey,
        );

    it('prefetches the proposal of the account on the URL', async () => {
        await createTestComponent();

        expect(queriedKeys()).toContainEqual(
            proposalBySlugOptions({
                urlParams: { slug: 'MULTISIG-3' },
                queryParams: { daoId: accountId },
            }).queryKey,
        );
        expect(queriedKeys()).toContainEqual(
            proposalActionsOptions({ urlParams: { id: 'proposal-id' } })
                .queryKey,
        );
    });

    it('prefetches the DAO, which the workspace layout does not hydrate', async () => {
        await createTestComponent();

        expect(queriedKeys()).toContainEqual(
            daoOptions({ urlParams: { id: accountId } }).queryKey,
        );
        // The CMS overrides are read too, with their failure swallowed so a CMS outage cannot fail the page.
        expect(queriedKeys()).toContainEqual(daoOverridesOptions().queryKey);
    });

    it('resolves the DAO from the URL without a lookup', async () => {
        await createTestComponent();

        expect(resolveDaoIdSpy).not.toHaveBeenCalled();
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
                params: Promise.resolve({
                    workspaceId: 'demo',
                    accountId,
                    proposalSlug: 'MULTISIG-3',
                }),
            }),
        ).rejects.toThrow('NEXT_HTTP_ERROR_FALLBACK;404');
        expect(querySpy).not.toHaveBeenCalled();
    });

    it('sends the reader back to the workspace proposals on a fetch error', async () => {
        querySpy.mockRejectedValue(new Error('not found'));
        render(await createTestComponent());

        expect(
            screen.getByRole('link', { name: /error\.action$/ }),
        ).toHaveAttribute(
            'href',
            `/workspace/demo/proposals?account=${accountId}`,
        );
    });
    // The backend accepts any casing and `resolveDaoId` is not strict about it, so the DAO route serves a link
    // whose address is not checksummed. This one addresses the same proposal and must serve it too, rather than
    // 404 on a casing the rest of the app accepts.
    it('accepts an account whose address is not checksummed', async () => {
        const upperCaseAddress = `0x${address.slice(2).toUpperCase()}`;
        render(
            await createTestComponent({
                params: Promise.resolve({
                    workspaceId: 'demo',
                    accountId: `${Network.ETHEREUM_SEPOLIA}-${upperCaseAddress}`,
                    proposalSlug: 'MULTISIG-3',
                }),
            }),
        );

        expect(notFoundMock).not.toHaveBeenCalled();
        expect(screen.getByTestId('page-client-mock')).toBeInTheDocument();
    });
});
