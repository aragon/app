// The `next/navigation` alias points to the client-hooks wrapper, which cannot re-export server functions.
import { notFound } from 'next/navigation-original';
import { Page } from '@/shared/components/page';
import { featureFlags } from '@/shared/featureFlags';
import type { IWorkspacePageParams } from '@/shared/types';
import { WorkspaceAccountGate } from '../../components/workspaceAccountGate';
import { workspaceAllAccountsSegment } from '../../utils/workspaceUtils';
import { WorkspaceProposalsPageClient } from './workspaceProposalsPageClient';

export interface IWorkspaceProposalsPageProps {
    /**
     * URL parameters of the page. `accountId` is set only on the account-scoped route: the aggregated one spells
     * the account `all`, a static segment that wins over `[accountId]`, so Next.js passes no such parameter
     * there — which is exactly what tells the two routes apart here.
     *
     * The aggregated sentinel is accepted as well, so that removing the static `all/proposals` route — which would
     * let the aggregated URL fall through to `[accountId]/proposals` with `accountId: 'all'` — degrades to the
     * ungated page rather than gating the aggregated route on an account that does not exist.
     */
    params: Promise<IWorkspacePageParams & { accountId?: string }>;
}

/**
 * Number of proposals read per page. Matches the DAO proposals page; the workspace API caps the page size at 50.
 */
export const workspaceProposalsCount = 10;

/**
 * Proposals of a workspace, serving both the aggregated route and the account-scoped one, which re-export this
 * same page. The client resolves which accounts to read from the route.
 *
 * The account-scoped route is wrapped in `WorkspaceAccountGate`; the aggregated one is not. That asymmetry is the
 * one thing this page owns, and it exists because the client **fails open**: it narrows to the route's account only
 * when that account is a DAO and otherwise falls back to every DAO account of the workspace, which cannot tell "no
 * account named" from "an account this page cannot serve". Without the gate a Safe route would therefore answer
 * with the proposals of every DAO account under a URL naming one Safe. The gate turns that into the same failure
 * the other account-scoped sections give, until Safe proposals exist — see "Safe support by route" in
 * `docs/projectDocs/createWorkspace.md`.
 *
 * The aggregated route needs no gate: it names no account, so there is nothing to resolve and nothing to mislead
 * about. Assets and transactions need none either, under either scope — they serve a Safe already.
 *
 * Nothing is prefetched: the proposal queries need the account list, which only exists in the local-storage
 * registry and is therefore resolved on the client (see `docs/projectDocs/createWorkspace.md`).
 */
export const WorkspaceProposalsPage: React.FC<
    IWorkspaceProposalsPageProps
> = async (props) => {
    const { params } = props;

    if (!(await featureFlags.isEnabled('workspaces'))) {
        notFound();
    }

    const { workspaceId, accountId } = await params;

    const page = (
        <Page.Container>
            <WorkspaceProposalsPageClient
                pageSize={workspaceProposalsCount}
                workspaceId={workspaceId}
            />
        </Page.Container>
    );

    if (accountId == null || accountId === workspaceAllAccountsSegment) {
        return page;
    }

    // TEMPORARY, and the whole wrap goes when Safe proposals land: this gate is what makes the account-scoped
    // route fail for a Safe, so once the client can narrow to a Safe it would be failing a route that works.
    // Removing it is half the change — `workspaceProposalsPageClient` must stop treating a non-DAO account as "no
    // account" at the same time, or the route silently widens to every DAO account again instead of failing.

    return (
        <WorkspaceAccountGate accountId={accountId}>
            {page}
        </WorkspaceAccountGate>
    );
};
