'use client';

import { Card, EmptyState } from '@aragon/gov-ui-kit';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useWorkspace } from '../../api/workspaceService';
import { WorkspaceAccountDropdown } from '../../components/workspaceAccountFilter';
import { useWorkspaceAccountSelectorContext } from '../../components/workspaceAccountSelectorProvider';
import { WorkspaceTransactionList } from '../../components/workspaceTransactionList';
import { WorkspaceTransactionsAsideCard } from '../../components/workspaceTransactionsAsideCard';

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

    const {
        data: workspace,
        isPending: isWorkspacePending,
        isError: isWorkspaceError,
    } = useWorkspace({ urlParams: { id: workspaceId } }, { retry: false });

    const accounts = workspace?.accounts ?? [];

    const { activeOption, setActiveOption, options } =
        useWorkspaceAccountSelectorContext();

    const accountsToDisplay =
        activeOption?.account != null ? [activeOption.account] : accounts;

    if (isWorkspaceError) {
        return (
            <Page.Main>
                <Card className="border border-neutral-100 py-10">
                    <EmptyState
                        description={t(
                            'app.workspace.workspaceTransactionsPage.notFound.description',
                            { id: workspaceId },
                        )}
                        heading={t(
                            'app.workspace.workspaceTransactionsPage.notFound.title',
                        )}
                        objectIllustration={{ object: 'MAGNIFYING_GLASS' }}
                    />
                </Card>
            </Page.Main>
        );
    }

    return (
        <Page.Content>
            <Page.Main
                title={t('app.workspace.workspaceTransactionsPage.main.title')}
            >
                <div className="flex flex-col gap-4 md:gap-6">
                    <WorkspaceAccountDropdown
                        onSelect={setActiveOption}
                        options={options}
                        value={activeOption}
                    />
                    <WorkspaceTransactionList
                        accounts={accountsToDisplay}
                        isPending={isWorkspacePending}
                        pageSize={pageSize}
                    />
                </div>
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
