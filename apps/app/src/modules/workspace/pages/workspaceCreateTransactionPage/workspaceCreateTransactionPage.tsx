import { Page } from '@/shared/components/page';
import type { IWorkspaceAccountPageParams } from '@/shared/types';
import { WorkspaceGate } from '../../components/workspaceGate';
import { WorkspaceCreateTransactionPageClient } from './workspaceCreateTransactionPageClient';

export interface IWorkspaceCreateTransactionPageProps {
    /**
     * URL parameters of the page.
     */
    params: Promise<IWorkspaceAccountPageParams>;
}

/**
 * Creates a transaction on one account of a workspace. Only a Safe account is served here: a DAO account creates its
 * transactions through the direct-execute wizard of the DAO, which the transactions page links to instead.
 *
 * Like the other workspace pages it performs no prefetch: the account is resolved from the workspace registry, which
 * is backed by local storage and cannot be read during a server render. It sits outside `LayoutWorkspace`, so it
 * renders its own `WorkspaceGate`. The `workspaces` flag and the account segment are checked by
 * `LayoutWizardCreateWorkspaceTransaction`.
 */
export const WorkspaceCreateTransactionPage: React.FC<
    IWorkspaceCreateTransactionPageProps
> = async (props) => {
    const { params } = props;
    const { workspaceId } = await params;

    return (
        <Page.Container>
            <WorkspaceGate workspaceId={workspaceId}>
                <WorkspaceCreateTransactionPageClient />
            </WorkspaceGate>
        </Page.Container>
    );
};
