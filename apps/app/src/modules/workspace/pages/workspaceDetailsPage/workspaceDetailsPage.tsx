import { QueryClient } from '@tanstack/react-query';
// The `next/navigation` alias points to the client-hooks wrapper, which cannot re-export server functions.
import { notFound } from 'next/navigation-original';
import { cmsService, daoOverridesOptions } from '@/shared/api/cmsService';
import { Page } from '@/shared/components/page';
import { featureFlags } from '@/shared/featureFlags';
import type { IWorkspacePageParams } from '@/shared/types';
import { WorkspaceDetailsPageClient } from './workspaceDetailsPageClient';

export interface IWorkspaceDetailsPageProps {
    /**
     * URL parameters of the page.
     */
    params: Promise<IWorkspacePageParams>;
}

/**
 * Overview of a workspace, which becomes the dashboard of the account picked on the workspace navigation.
 *
 * The workspace itself is resolved on the client because the mocked registry is backed by local storage and cannot be
 * read during a server render (see `docs/projectDocs/createWorkspace.md`), and so is the DAO of the selected account,
 * which is only known once the registry is read. The CMS reads do not depend on the registry, so they are made here
 * the way `daoDashboardPage` makes them: the DAO overrides are prefetched so hidden plugins never flash in, and the
 * featured delegates are handed to the client.
 */
export const WorkspaceDetailsPage: React.FC<
    IWorkspaceDetailsPageProps
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
            <WorkspaceDetailsPageClient
                featuredDelegates={featuredDelegates}
                workspaceId={workspaceId}
            />
        </Page.Container>
    );
};
