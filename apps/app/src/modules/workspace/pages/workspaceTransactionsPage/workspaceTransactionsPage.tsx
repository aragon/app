// The `next/navigation` alias points to the client-hooks wrapper, which cannot re-export server functions.
import { notFound } from 'next/navigation-original';
import { Page } from '@/shared/components/page';
import { featureFlags } from '@/shared/featureFlags';
import type { IWorkspacePageParams } from '@/shared/types';
import { WorkspaceTransactionsPageClient } from './workspaceTransactionsPageClient';

export interface IWorkspaceTransactionsPageProps {
    /**
     * URL parameters of the page.
     */
    params: Promise<IWorkspacePageParams>;
}

export const workspaceTransactionsCount = 20;

/**
 * Transactions of a workspace under either scope: every account of the workspace, or one account.
 *
 * One page serves both, as the assets page does. Every scope reads `POST /v2/workspaces/query/transactions`, which
 * is what keeps a single account summing into the aggregated view — both come out of the same aggregation — and
 * what makes a Safe account, which has no DAO page to delegate to, readable at all. For the same reason
 * `WorkspaceAccountGate` is deliberately not applied here: it fails a route whose DAO record cannot be read, which
 * would withhold a list this page serves without reading a DAO at all. Which routes serve a Safe and which fail is
 * listed under "Safe support by route" in `docs/projectDocs/createWorkspace.md`.
 *
 * The scope is not read here. The aggregated route spells the account `all`, a static segment, so there is no
 * `accountId` parameter to read on that route and typing one would be a lie; the client resolves the scope from the
 * route instead (`useWorkspaceAccountOptions`).
 *
 * Like the other workspace pages it performs no prefetch: the accounts to query come from the workspace registry,
 * which is backed by local storage and cannot be read during a server render, so a prefetch would always miss (see
 * `docs/projectDocs/createWorkspace.md`). Once a real registry lands, `layoutWorkspace` fetches the workspace for
 * every page and this page prefetches `workspaceTransactionsOptions` the way `daoTransactionsPage` does.
 */
export const WorkspaceTransactionsPage: React.FC<
    IWorkspaceTransactionsPageProps
> = async () => {
    if (!(await featureFlags.isEnabled('workspaces'))) {
        notFound();
    }

    return (
        <Page.Container>
            <WorkspaceTransactionsPageClient
                pageSize={workspaceTransactionsCount}
            />
        </Page.Container>
    );
};
