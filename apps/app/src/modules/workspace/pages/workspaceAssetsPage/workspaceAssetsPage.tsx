// The `next/navigation` alias points to the client-hooks wrapper, which cannot re-export server functions.
import { notFound } from 'next/navigation-original';
import { Page } from '@/shared/components/page';
import { featureFlags } from '@/shared/featureFlags';
import type { IWorkspacePageParams } from '@/shared/types';
import { WorkspaceAssetsPageClient } from './workspaceAssetsPageClient';

export interface IWorkspaceAssetsPageProps {
    /**
     * URL parameters of the page.
     */
    params: Promise<IWorkspacePageParams>;
}

/**
 * Number of assets read per page. Matches the DAO assets page; the workspace API caps the page size at 50.
 */
export const workspaceAssetsCount = 20;

/**
 * Assets of a workspace under either scope: every account of the workspace, or one account.
 *
 * One page serves both, unlike the account overview, which renders `DaoDashboardPage` as is. Every scope reads
 * `POST /v2/workspaces/query/assets`, which is what keeps a single account summing into the aggregated view — both
 * come out of the same aggregation — and what makes a Safe account, which has no DAO page to delegate to, readable
 * at all. For the same reason `WorkspaceAccountGate` is deliberately not applied here: it fails the route when the
 * DAO cannot be read, which is the permanent state of every Safe.
 *
 * The scope is not read here. The aggregated route spells the account `all`, a static segment, so there is no
 * `accountId` parameter to read on that route and typing one would be a lie; the client resolves the scope from the
 * route instead (`useWorkspaceAccountOptions`).
 *
 * Nothing is prefetched: the asset queries need the account list, which only exists in the local-storage registry
 * and is therefore resolved on the client (see `docs/projectDocs/createWorkspace.md`).
 */
export const WorkspaceAssetsPage: React.FC<IWorkspaceAssetsPageProps> = async (
    props,
) => {
    const { params } = props;

    if (!(await featureFlags.isEnabled('workspaces'))) {
        notFound();
    }

    const { workspaceId } = await params;

    return (
        <Page.Container>
            <WorkspaceAssetsPageClient
                pageSize={workspaceAssetsCount}
                workspaceId={workspaceId}
            />
        </Page.Container>
    );
};
