import type { ReactNode } from 'react';
import { WorkspaceGate } from '@/modules/workspace/components/workspaceGate';
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
 * It deliberately fetches nothing. The workspace registry is backed by local storage, so it cannot be read during a
 * server render and there is no query to prefetch or hydrate here — `WorkspaceGate` loads it on the client and
 * holds the pages back until it resolves (see `docs/projectDocs/createWorkspace.md`). Once a real registry exists
 * this layout becomes the place to fetch the workspace once and hydrate it for every page.
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

    return (
        <>
            <NavigationWorkspace workspaceId={workspaceId} />
            <WorkspaceGate workspaceId={workspaceId}>
                <ErrorBoundary>{children}</ErrorBoundary>
            </WorkspaceGate>
        </>
    );
};
