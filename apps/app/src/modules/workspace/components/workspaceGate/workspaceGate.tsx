'use client';

import { Spinner } from '@aragon/gov-ui-kit';
import type { ReactNode } from 'react';
import { Page } from '@/shared/components/page';
import { useWorkspace } from '../../api/workspaceService';

export interface IWorkspaceGateProps {
    /**
     * ID of the workspace.
     */
    workspaceId: string;
    /**
     * Children rendered once the workspace has loaded.
     */
    children?: ReactNode;
}

/**
 * Loads the workspace of the pages below and renders them only once it has resolved.
 *
 * The workspace registry is backed by local storage, so it cannot be read during a server render (see
 * `docs/projectDocs/createWorkspace.md`) and the loading and error states have to live on the client. Owning them
 * here is what lets every page below assume a loaded workspace, and every page reads the workspace under the same
 * query key, so this costs no extra request.
 */
export const WorkspaceGate: React.FC<IWorkspaceGateProps> = (props) => {
    const { workspaceId, children } = props;

    // Retrying is pointless as the registry is read from local storage and fails the same way every time.
    const { isPending, error } = useWorkspace(
        { urlParams: { id: workspaceId } },
        { retry: false },
    );

    if (isPending) {
        return (
            <div className="flex grow items-center justify-center py-20">
                <Spinner size="lg" variant="neutral" />
            </div>
        );
    }

    if (error != null) {
        return (
            <Page.Error
                descriptionKey="app.workspace.workspaceGate.error.description"
                titleKey="app.workspace.workspaceGate.error.title"
            />
        );
    }

    return children;
};
