// The `next/navigation` alias points to the client-hooks wrapper, which cannot re-export server functions.
import { notFound } from 'next/navigation-original';
import { Page } from '@/shared/components/page';
import { featureFlags } from '@/shared/featureFlags';
import type { IWorkspacePageParams } from '@/shared/types';
import { WorkspaceTransactionsPageClient } from './workspaceTransactionsPageClient';

export const workspaceTransactionsCount = 20;

export interface IWorkspaceTransactionsPageProps {
    /**
     * URL parameters of the page.
     */
    params: Promise<IWorkspacePageParams>;
}

/**
 * Transactions of every account of a workspace, aggregated into a single list.
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

    // Only the pagination can be built here: the accounts complete the request on the client, where the registry
    // is readable.
    const initialParams = {
        queryParams: { pageSize: workspaceTransactionsCount },
    };

    return (
        <Page.Container>
            <WorkspaceTransactionsPageClient
                initialParams={initialParams}
                workspaceId={workspaceId}
            />
        </Page.Container>
    );
};
