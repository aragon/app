import type { ReactNode } from 'react';
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
 * server render and there is no query to prefetch or hydrate here — the navigation and the pages read it on the
 * client instead (see `docs/projectDocs/createWorkspace.md`). Once a real registry exists this layout becomes the
 * place to fetch the workspace once and hydrate it for every page, as well as to prefetch the accounts backing them.
 */
export const LayoutWorkspace: React.FC<ILayoutWorkspaceProps> = async (
    props,
) => {
    const { params, children } = props;
    const { workspaceId } = await params;

    return (
        <>
            <NavigationWorkspace workspaceId={workspaceId} />
            <ErrorBoundary>{children}</ErrorBoundary>
        </>
    );
};
