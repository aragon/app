import { QueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { daoOptions } from '@/shared/api/daoService';
import { daoUtils } from '@/shared/utils/daoUtils';
import { workspaceQueryService } from '../../api/workspaceQueryService';
import type { WorkspaceAccountState } from '../../constants/workspaceAccountState';
import { workspaceUtils } from '../../utils/workspaceUtils';
import { WorkspaceAccountGateError } from './workspaceAccountGateError';

export interface IWorkspaceAccountGateProps {
    /**
     * ID of the account the page below is scoped to, which for a DAO account doubles as the ID of its DAO.
     */
    accountId: string;
    /**
     * Children rendered once the DAO record of the account can be read.
     */
    children?: ReactNode;
}

/**
 * Renders the page of one workspace account only when the DAO record of that account can be read, the counterpart
 * of `WorkspaceGate` one level down. Anything else — a Safe, an address the backend does not index, a DAO whose
 * record cannot be fetched — gets a state of its own instead of the page (`WorkspaceAccountGateError`).
 *
 * The pages below are DAO pages, and a DAO page assumes a resolved DAO: it reads it with `useDao` and renders
 * whatever it can from `undefined` otherwise. Under the DAO routes that assumption holds because the DAO layout
 * fails the route when the DAO cannot be read. It does not hold here — a workspace account may be a Safe, or an
 * address the backend does not index, and `LayoutWorkspaceAccount` deliberately prefetches with `prefetchQuery`,
 * which resolves rather than throws, so that the sections needing no DAO keep working. Owning the failure here is
 * what keeps a half-rendered DAO page from standing in for an error state.
 *
 * A Safe therefore fails here, deliberately and for now: every section is meant to grow a Safe counterpart, and
 * until one exists the honest answer is a state pointing to the sections that do serve it rather than a page that
 * cannot describe the account. Which sections already serve a Safe and which do not is tracked in one place — see
 * "Safe support by route" in `docs/projectDocs/createWorkspace.md`.
 *
 * The DAO read decides whether the page renders; the account type only decides which state replaces it. A failed
 * DAO read alone cannot tell a Safe from an address that is neither a DAO nor a Safe — both 404 — and the account
 * on the route may be one the workspace does not hold, so it is not known from the registry either. Only then does
 * the gate look the address up in the workspace accounts API (`workspaceUtils.resolveAccountState`), so a DAO that
 * loads costs no extra request.
 *
 * The read happens on the server, so the outcome is settled before anything reaches the client: no client-side
 * loading state, and no client refetch of a DAO that already failed to load. `httpService` uses native `fetch`, so
 * Next.js memoizes this GET against the layout's prefetch within one render and it reaches the backend once.
 *
 * The gate deliberately stays a per-page wrapper instead of moving into `LayoutWorkspaceAccount`, although both sit
 * on the same route scope: a layout cannot withhold a page. Layout and page render in parallel, so the page
 * executes even when the layout renders something else in place of its children. `DaoMembersPage` reads its DAO
 * through `notFoundUtils.fetchOrNotFound`, which calls `notFound()` for an unresolvable resource — which is exactly
 * what `GET /daos/{safeAddress}` is. The nearest boundary, `app/workspace/[workspaceId]/not-found.tsx`, sits above
 * `[accountId]`, so that 404 would discard the account layout and anything it rendered in place of its children.
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

        return children;
    } catch {
        // Falls through to the lookup, which tells why the DAO cannot be read.
    }

    const { network, address } = daoUtils.parseDaoId(accountId);
    let accountState: WorkspaceAccountState | undefined;

    try {
        const accountInfos = await workspaceQueryService.getAccounts({
            body: { accounts: [{ network, address }] },
        });
        // The lookup names a single account, so its only entry is that account.
        accountState = workspaceUtils.resolveAccountState(accountInfos[0]);
    } catch (error: unknown) {
        accountState = workspaceUtils.resolveAccountState(undefined, error);
    }

    return <WorkspaceAccountGateError accountState={accountState} />;
};
