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

export const WorkspaceTransactionsPageClient: React.FC<
    IWorkspaceTransactionsPageClientProps
> = (props) => {
    const { workspaceId, pageSize } = props;

    const { t } = useTranslations();

    const { data: workspace, isPending: isWorkspacePending } = useWorkspace({
        urlParams: { id: workspaceId },
    });

    const accounts = workspace?.accounts ?? [];

    const { activeOption } = useWorkspaceAccountOptions();

    return (
        <Page.Content>
            <Page.Main
                title={t('app.workspace.workspaceTransactionsPage.main.title')}
            >
                <WorkspaceTransactionList
                    accounts={accounts}
                    isPending={isWorkspacePending}
                    pageSize={pageSize}
                />
            </Page.Main>
            <Page.Aside>
                {workspace != null && (
                    <WorkspaceTransactionsAsideCard
                        activeOption={activeOption}
                        pageSize={pageSize}
                        workspace={workspace}
                    />
                )}
            </Page.Aside>
        </Page.Content>
    );
};
