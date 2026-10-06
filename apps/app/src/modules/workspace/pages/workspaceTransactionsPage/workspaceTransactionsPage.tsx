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
 * `WorkspaceAccountGate` is deliberately not applied here: it fails the route when the DAO cannot be read, which is
 * the permanent state of every Safe.
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
> = async (props) => {
    const { params } = props;

    if (!(await featureFlags.isEnabled('workspaces'))) {
        notFound();
    }

    const { workspaceId } = await params;

    return (
        <Page.Container>
            <WorkspaceTransactionsPageClient
                pageSize={workspaceTransactionsCount}
                workspaceId={workspaceId}
            />
        </Page.Container>
    );
};
