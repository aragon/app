// The `next/navigation` alias points to the client-hooks wrapper, which cannot re-export server functions.
import { notFound } from 'next/navigation-original';
import { Page } from '@/shared/components/page';
import { featureFlags } from '@/shared/featureFlags';
import type { IWorkspacePageParams } from '@/shared/types';
import { WorkspaceSectionGuard } from '../../components/workspaceSectionGuard';
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
 * Only the account-scoped route is wrapped in `WorkspaceSectionGuard`, which redirects a Safe to its overview: the
 * client keeps DAO accounts only, so a Safe would otherwise get an empty list. The aggregated route names no account
 * and needs no guard. See "Safe support by route" in `docs/projectDocs/createWorkspace.md`.
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

    return (
        <WorkspaceSectionGuard
            accountId={accountId}
            section="proposals"
            workspaceId={workspaceId}
        >
            {page}
        </WorkspaceSectionGuard>
    );
};
