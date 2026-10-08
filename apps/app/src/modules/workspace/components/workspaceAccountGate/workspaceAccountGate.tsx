import {
    dehydrate,
    HydrationBoundary,
    QueryClient,
} from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { daoOptions } from '@/shared/api/daoService';
import { WorkspaceAccountGateError } from './workspaceAccountGateError';

export interface IWorkspaceAccountGateProps {
    /**
     * ID of the account the page below is scoped to, which doubles as the ID of its DAO.
     */
    accountId: string;
    /**
     * Children rendered once the DAO of the account has resolved.
     */
    children?: ReactNode;
}

/**
 * Renders the page of one workspace account only when the DAO of that account can be read, the counterpart of
 * `WorkspaceGate` one level down.
 *
 * The pages below are DAO pages, and a DAO page assumes a resolved DAO: it reads it with `useDao` and renders
 * whatever it can from `undefined` otherwise. Under the DAO routes that assumption holds because the DAO layout
 * fails the route when the DAO cannot be read. It does not hold here — a workspace account may be a Safe, or an
 * address the backend does not index, and `LayoutWorkspaceAccount` deliberately prefetches with `prefetchQuery`,
 * which resolves rather than throws, so that the sections needing no DAO keep working. Owning the failure here is
 * what keeps a half-rendered DAO page from standing in for an error state.
 *
 * The DAO is read on the server, so the outcome is settled before anything reaches the client: no client-side
 * loading state, and no client refetch of a DAO that already failed to load. The read is the same GET request
 * `LayoutWorkspaceAccount` makes within the same render, which Next.js memoizes, so it reaches the backend once.
 * The DAO is hydrated here too so the gate stays self-sufficient.
 *
 * TODO: once Safe accounts are implemented, merge this gate into `LayoutWorkspaceAccount` instead of wrapping every
 * account-level page. The gate has to learn the account type first: it currently renders an error for anything that
 * is not a DAO, which in the layout would also block the sections a Safe can serve (assets, transactions). The merge
 * replaces the layout's DAO `prefetchQuery` with this `fetchQuery`, renders the error state in place of `children`,
 * and drops the wrapper from the pages. Before merging, check that a DAO page rendered under a layout that withholds
 * its children cannot surface its own `notFound()` (e.g. `DaoMembersPage`) over the gate's error state.
 */
export const WorkspaceAccountGate: React.FC<
    IWorkspaceAccountGateProps
> = async (props) => {
    const { accountId, children } = props;

    const queryClient = new QueryClient();

    try {
        await queryClient.fetchQuery(
            daoOptions({ urlParams: { id: accountId } }),
        );
    } catch {
        return <WorkspaceAccountGateError />;
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            {children}
        </HydrationBoundary>
    );
};
