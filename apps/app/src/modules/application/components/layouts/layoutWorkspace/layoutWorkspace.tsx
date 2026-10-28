import {
    dehydrate,
    HydrationBoundary,
    QueryClient,
} from '@tanstack/react-query';
import { notFound } from 'next/navigation-server';
import type { ReactNode } from 'react';
import { daoOverridesOptions } from '@/shared/api/cmsService';
import { featureFlags } from '@/shared/featureFlags';
import type { IWorkspacePageParams } from '@/shared/types';
import { ErrorBoundary } from '../../errorBoundary';
import { LayoutWorkspaceContent } from './layoutWorkspaceContent';

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
 * Layout of the workspace pages: the workspace navigation (sidebar from `lg`, bar below it) plus the page itself.
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
 * it. `LayoutWorkspaceContent` shows it once the workspace read has answered: not while it is pending, so a link to a
 * workspace that does not exist never flashes a navigation, and not for that workspace, whose gate state carries its
 * own way out.
 *
 * The account a page is scoped to is a route segment, not state, so there is nothing here to reset when the
 * workspace changes.
 *
 * The `workspaces` flag is checked here and not only on the pages: a layout renders around a page's 404, so
 * without it a disabled feature would still show the navigation and the gate.
 */
export const LayoutWorkspace: React.FC<ILayoutWorkspaceProps> = async (
    props,
) => {
    const { params, children } = props;

    if (!(await featureFlags.isEnabled('workspaces'))) {
        notFound();
    }

    const { workspaceId } = await params;

    const queryClient = new QueryClient();
    await queryClient.prefetchQuery(daoOverridesOptions());

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <LayoutWorkspaceContent workspaceId={workspaceId}>
                <ErrorBoundary>{children}</ErrorBoundary>
            </LayoutWorkspaceContent>
        </HydrationBoundary>
    );
};
