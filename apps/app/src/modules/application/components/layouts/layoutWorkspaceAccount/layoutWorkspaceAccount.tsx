import {
    dehydrate,
    HydrationBoundary,
    QueryClient,
} from '@tanstack/react-query';
import { notFound } from 'next/navigation-server';
import type { ReactNode } from 'react';
// biome-ignore lint/style/noRestrictedImports: server component cannot use the gov-ui-kit client shim; called with { strict: false } below.
import { isAddress } from 'viem';
import { daoOverridesOptions } from '@/shared/api/cmsService';
import { daoOptions } from '@/shared/api/daoService';
import type { IWorkspaceAccountPageParams } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { networkUtils } from '@/shared/utils/networkUtils';
import { ErrorBoundary } from '../../errorBoundary';

export interface ILayoutWorkspaceAccountProps {
    /**
     * Children of the layout.
     */
    children?: ReactNode;
    /**
     * URL parameters of the layout.
     */
    params: Promise<IWorkspaceAccountPageParams>;
}

/**
 * Layout of the pages of a workspace scoped to one account, `/workspace/{workspaceId}/{accountId}/…`.
 *
 * This is what the account scope buys: an account ID is also a DAO ID, so the DAO resolves here without reading the
 * workspace registry — which lives on local storage and is unreadable during a server render (see
 * `docs/projectDocs/createWorkspace.md`). Fetching it once here hydrates it for every section below, the way
 * `LayoutDao` does for the DAO pages, so those sections render complete on the first paint instead of behind a
 * client-side spinner. A prefetch added to `LayoutDao` does not reach these routes and belongs here too.
 *
 * Both reads use `prefetchQuery`, which resolves rather than throws, because neither is load-bearing *here*:
 *
 * - A workspace holds Safe accounts as well as DAOs, and a Safe has no DAO to read. The sections that need one
 *   render their own not-found state; the ones that do not — assets, transactions — work from the workspace query
 *   endpoints regardless.
 * - The CMS overrides are prefetched so hidden plugins never flash in, but a CMS hiccup must not fail the page.
 */
export const LayoutWorkspaceAccount: React.FC<
    ILayoutWorkspaceAccountProps
> = async (props) => {
    const { params, children } = props;
    const { accountId } = await params;

    // Bots constantly probe account-addressed URLs with unknown or malformed addresses. The DAO routes filter those
    // through `resolveDaoId`; here the account ID is used verbatim as the DAO ID, so it is validated before any
    // request. Not strict about the checksum, as `resolveDaoId` is not either: the backend accepts any casing, so a
    // lowercase account on a shared link addresses the same pages.
    const { network, address } = daoUtils.parseDaoId(accountId);

    if (
        !networkUtils.isValidNetwork(network) ||
        !isAddress(address, { strict: false })
    ) {
        notFound();
    }

    const queryClient = new QueryClient();

    // TODO: once Safe accounts are implemented, `WorkspaceAccountGate` moves here and its `fetchQuery` replaces this
    // DAO prefetch — see the TODO on the gate for what has to hold first.
    await Promise.all([
        queryClient.prefetchQuery(daoOptions({ urlParams: { id: accountId } })),
        queryClient.prefetchQuery(daoOverridesOptions()),
    ]);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ErrorBoundary>{children}</ErrorBoundary>
        </HydrationBoundary>
    );
};
