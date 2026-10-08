import {
    dehydrate,
    HydrationBoundary,
    QueryClient,
} from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { WorkspaceGate } from '@/modules/workspace/components/workspaceGate';
import { daoOverridesOptions } from '@/shared/api/cmsService';
import type { IWorkspacePageParams } from '@/shared/types';
import { ErrorBoundary } from '../../errorBoundary';
import { NavigationWorkspace } from '../../navigations/navigationWorkspace';

export interface ILayoutWorkspaceProps {
    /**
     * Children of the layout.
     */
    children?: ReactNode;
    /**
     * URL parameters of the layout.
     */
    params: Promise<IWorkspacePageParams>;
}

/**
 * Layout of the workspace pages: the workspace navigation bar plus the page itself.
 *
 * The workspace itself is not fetched here. Its registry is backed by local storage for now, so it cannot be read during a
 * server render — `WorkspaceGate` loads it on the client and holds the pages back until it resolves (see
 * `docs/projectDocs/createWorkspace.md`). Once a real registry exists this layout becomes the place to fetch the
 * workspace once and hydrate it for every page.
 *
 * The CMS visibility overrides are prefetched here, for every workspace page. Every page under the workspace layout
 * that needs them reads them from the same query.
 *
 * The navigation sits beside the gate rather than inside it, so the gate holds back the page and not the way out of
 * it. Its section links are built from the workspace ID on the route, which needs no read, so the bar is navigable
 * on a cold load and while the workspace is failing to load — only the workspace name, avatar and account count
 * wait for the read. Inside the gate the whole bar would be replaced by the spinner, leaving a reader who opened a
 * link to a workspace that is slow or missing with nothing to click. This may be worth exploring having a skeleton
 * to minimize the jarring effect of layout shifts
 *
 * The account a page is scoped to is a route segment, not state, so there is nothing here to reset when the
 * workspace changes.
 */
export const LayoutWorkspace: React.FC<ILayoutWorkspaceProps> = async (
    props,
) => {
    const { params, children } = props;
    const { workspaceId } = await params;

    const queryClient = new QueryClient();
    await queryClient.prefetchQuery(daoOverridesOptions());

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <NavigationWorkspace workspaceId={workspaceId} />
            <WorkspaceGate workspaceId={workspaceId}>
                <ErrorBoundary>{children}</ErrorBoundary>
            </WorkspaceGate>
        </HydrationBoundary>
    );
};
