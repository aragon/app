'use client';

import type { ReactNode } from 'react';
import { useWorkspace } from '@/modules/workspace/api/workspaceService';
import { WorkspaceGate } from '@/modules/workspace/components/workspaceGate';
import { AragonBackendServiceError } from '@/shared/api/aragonBackendService';
import { NavigationWorkspace } from '../../navigations/navigationWorkspace';
import { LayoutSidebar } from '../layoutSidebar';

export interface ILayoutWorkspaceContentProps {
    /**
     * ID of the workspace of the pages.
     */
    workspaceId: string;
    /**
     * Pages of the workspace, held back by `WorkspaceGate` until the workspace has loaded.
     */
    children?: ReactNode;
}

/**
 * Workspace navigation beside the gated pages, once the workspace read has answered and the workspace exists.
 *
 * While the read is pending the gate shows its spinner alone: the navigation would otherwise paint and then vanish
 * for a workspace that does not exist. A workspace that does not exist has nothing to navigate — its selectors would be
 * empty and its links lead to sections of nothing — so the gate's state is left alone, with its own way out, as a DAO
 * page is when its DAO does not exist. A read that failed for another reason keeps the navigation as a way out.
 *
 * Only the navigation comes and goes: the gate keeps its place in the tree. Remounting it would refetch a failed
 * read, which puts the query back to pending and loops.
 */
export const LayoutWorkspaceContent: React.FC<ILayoutWorkspaceContentProps> = (
    props,
) => {
    const { workspaceId, children } = props;

    // Same query and options as the gate, so this observes its read rather than adding one.
    const { status, error } = useWorkspace(
        { urlParams: { id: workspaceId } },
        { retry: false },
    );
    const hasNavigation =
        status === 'success' ||
        (status === 'error' &&
            !AragonBackendServiceError.isNotFoundError(error));

    return (
        <LayoutSidebar
            navigation={
                hasNavigation ? (
                    <NavigationWorkspace workspaceId={workspaceId} />
                ) : null
            }
        >
            <WorkspaceGate workspaceId={workspaceId}>{children}</WorkspaceGate>
        </LayoutSidebar>
    );
};
