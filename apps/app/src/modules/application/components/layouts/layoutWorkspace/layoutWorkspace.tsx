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
 * The navigation sits inside the gate rather than beside it. Everything it displays — the workspace name and
 * avatar, the account options, the section links — comes from that read, so outside the gate it would paint as an
 * empty bar and fill in a frame later. It costs nothing on a section or account change, which keeps this layout
 * mounted and the workspace cached; the gate only holds on a cold entry, where there is nothing to show anyway.
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
        <WorkspaceGate workspaceId={workspaceId}>
            <NavigationWorkspace workspaceId={workspaceId} />
            <ErrorBoundary>{children}</ErrorBoundary>
        </WorkspaceGate>
    );
};
