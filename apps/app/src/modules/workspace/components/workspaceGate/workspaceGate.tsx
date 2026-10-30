'use client';

import { Spinner } from '@aragon/gov-ui-kit';
import { useParams } from 'next/navigation';
import type { ReactNode } from 'react';
import { AragonBackendServiceError } from '@/shared/api/aragonBackendService';
import { Page } from '@/shared/components/page';
import type { IWorkspaceAccountPageParams } from '@/shared/types';
import { useWorkspace } from '../../api/workspaceService';
import {
    workspaceAllAccountsSegment,
    workspaceUtils,
} from '../../utils/workspaceUtils';
import { WorkspaceGateAccountPrompt } from './workspaceGateAccountPrompt';
import { WorkspaceGateNotFound } from './workspaceGateNotFound';

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
 *
 * A workspace the registry does not hold is the expected outcome of a shared link, as the registry lives on one
 * device, so it gets states of its own instead of the error: a link scoped to an account offers to open the same page
 * in one of the reader's workspaces (`WorkspaceGateAccountPrompt`), any other link offers a way into them
 * (`WorkspaceGateNotFound`). Any other failure keeps the generic error.
 */
export const WorkspaceGate: React.FC<IWorkspaceGateProps> = (props) => {
    const { workspaceId, children } = props;

    // Absent on the routes that are not account-scoped, e.g. the edit wizard.
    const { accountId } = useParams<Partial<IWorkspaceAccountPageParams>>();

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
        if (!AragonBackendServiceError.isNotFoundError(error)) {
            return (
                <Page.Error
                    descriptionKey="app.workspace.workspaceGate.error.description"
                    titleKey="app.workspace.workspaceGate.error.title"
                />
            );
        }

        // An account segment that is not a valid account ID reads as the aggregated one, so it gets the plain state.
        const accountScope = workspaceUtils.resolveAccountScope(accountId);

        return accountScope === workspaceAllAccountsSegment ? (
            <WorkspaceGateNotFound />
        ) : (
            <WorkspaceGateAccountPrompt accountId={accountScope} />
        );
    }

    return children;
};
