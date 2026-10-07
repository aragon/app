'use client';

import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useWorkspace } from '../../api/workspaceService';
import { WorkspaceTransactionList } from '../../components/workspaceTransactionList';
import { WorkspaceTransactionsAsideCard } from '../../components/workspaceTransactionsAsideCard';
import { useWorkspaceAccountOptions } from '../../hooks/useWorkspaceAccountOptions';

export interface IWorkspaceTransactionsPageClientProps {
    /**
     * ID of the workspace to display the transactions of.
     */
    workspaceId: string;
    /**
     * Number of transactions to read per page.
     */
    pageSize: number;
}

/**
 * Transactions of a workspace, scoped to the account on the route.
 *
 * One page serves both scopes, as the assets page does: every scope reads the same workspace query endpoint, so a
 * single account sums into the aggregated view, and a Safe account — which has no DAO page to delegate to — is
 * readable at all.
 */
export const WorkspaceTransactionsPageClient: React.FC<
    IWorkspaceTransactionsPageClientProps
> = (props) => {
    const { workspaceId, pageSize } = props;

    const { t } = useTranslations();

    const { data: workspace, isPending: isWorkspacePending } = useWorkspace({
        urlParams: { id: workspaceId },
    });

    const { activeOption } = useWorkspaceAccountOptions();

    const accounts = workspace?.accounts ?? [];

    const selectedAccount = activeOption?.account;
    const accountsToDisplay =
        selectedAccount != null ? [selectedAccount] : accounts;

    return (
        <Page.Content>
            <Page.Main
                title={t('app.workspace.workspaceTransactionsPage.main.title')}
            >
                <WorkspaceTransactionList
                    accounts={accountsToDisplay}
                    isPending={isWorkspacePending}
                    pageSize={pageSize}
                />
            </Page.Main>
            <Page.Aside>
                {workspace != null && (
                    <WorkspaceTransactionsAsideCard
                        accounts={accountsToDisplay}
                        activeOption={activeOption}
                        pageSize={pageSize}
                    />
                )}
            </Page.Aside>
        </Page.Content>
    );
};
