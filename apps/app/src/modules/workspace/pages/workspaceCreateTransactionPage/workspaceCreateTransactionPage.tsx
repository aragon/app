import { Page } from '@/shared/components/page';
import { WorkspaceCreateTransactionPageClient } from './workspaceCreateTransactionPageClient';

/**
 * Creates a transaction on one account of a workspace. Only a Safe account is served here: a DAO account creates its
 * transactions through the direct-execute wizard of the DAO, which the transactions page links to instead.
 *
 * Like the other workspace pages it performs no prefetch: the account is resolved from the workspace registry, which
 * is backed by local storage and cannot be read during a server render. The `workspaces` flag and the account segment
 * are checked by `LayoutWizardCreateWorkspaceTransaction`.
 */
export const WorkspaceCreateTransactionPage: React.FC = () => (
    <Page.Container>
        <WorkspaceCreateTransactionPageClient />
    </Page.Container>
);
