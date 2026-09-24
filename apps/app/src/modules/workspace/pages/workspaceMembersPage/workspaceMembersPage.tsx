import { QueryClient } from '@tanstack/react-query';
// The `next/navigation` alias points to the client-hooks wrapper, which cannot re-export server functions.
import { notFound } from 'next/navigation-original';
import { cmsService, daoOverridesOptions } from '@/shared/api/cmsService';
import { Page } from '@/shared/components/page';
import { featureFlags } from '@/shared/featureFlags';
import type { IWorkspacePageParams } from '@/shared/types';
import { WorkspaceMembersPageClient } from './workspaceMembersPageClient';

/**
 * Number of members read per page, the same as the DAO members page the list is borrowed from.
 */
export const workspaceMembersCount = 18;

export interface IWorkspaceMembersPageProps {
    /**
     * URL parameters of the page.
     */
    params: Promise<IWorkspacePageParams>;
}

/**
 * Members of one DAO account of a workspace at a time, rendered by the DAO members page itself.
 *
 * Like the other workspace pages it performs no member prefetch: the accounts to query come from the workspace
 * registry, which is backed by local storage and cannot be read during a server render, so a prefetch would always
 * miss (see `docs/projectDocs/createWorkspace.md`). The CMS reads do not depend on the registry, so they are made
 * here the way `daoMembersPage` makes them: the DAO overrides are prefetched so hidden bodies never flash in as
 * tabs, and the featured delegates are handed to the client.
 */
export const WorkspaceMembersPage: React.FC<
    IWorkspaceMembersPageProps
> = async (props) => {
    const { params } = props;

    if (!(await featureFlags.isEnabled('workspaces'))) {
        notFound();
    }

    const { workspaceId } = await params;

    const queryClient = new QueryClient();
    const [featuredDelegates] = await Promise.all([
        cmsService.getFeaturedDelegates(),
        queryClient.fetchQuery(daoOverridesOptions()),
    ]);

    return (
        <Page.Container queryClient={queryClient}>
            <WorkspaceMembersPageClient
                featuredDelegates={featuredDelegates}
                pageSize={workspaceMembersCount}
                workspaceId={workspaceId}
            />
        </Page.Container>
    );
};
