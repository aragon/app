// The `next/navigation` alias points to the client-hooks wrapper, which cannot re-export server functions.
import { notFound } from 'next/navigation-original';
import { Page } from '@/shared/components/page';
import { featureFlags } from '@/shared/featureFlags';
import type { IWorkspacePageParams } from '@/shared/types';
import { WorkspaceMembersPageClient } from './workspaceMembersPageClient';

export interface IWorkspaceMembersPageProps {
    /**
     * URL parameters of the page.
     */
    params: Promise<IWorkspacePageParams>;
}

/**
 * Members of a workspace, which are always the members of one of its accounts.
 *
 * Nothing is prefetched, and nothing needs to be: there is no aggregated membership to read, so this page only
 * points the reader at an account. The list belongs to the account-scoped route.
 */
export const WorkspaceMembersPage: React.FC<
    IWorkspaceMembersPageProps
> = async () => {
    if (!(await featureFlags.isEnabled('workspaces'))) {
        notFound();
    }

    return (
        <Page.Container>
            <WorkspaceMembersPageClient />
        </Page.Container>
    );
};
