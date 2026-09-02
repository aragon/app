'use client';

import { useTransactionList } from '@/modules/finance/api/financeService';
import { TransactionList } from '@/modules/finance/components/transactionList';
import { FinanceDialogId } from '@/modules/finance/constants/financeDialogId';
import { useWorkspaceAssetList } from '@/modules/workspace/api/workspaceFinanceService';
import { useWorkspace } from '@/modules/workspace/api/workspaceService';
import { WorkspaceAccountFilter } from '@/modules/workspace/components/workspaceAccountFilter';
import { WorkspaceFilterAsideCard } from '@/modules/workspace/components/workspaceFilterAsideCard';
import { WorkspaceTransactionList } from '@/modules/workspace/components/workspaceTransactionList';
import { workspaceAccountFilterParam } from '@/modules/workspace/constants/workspaceFilterParam';
import { useWorkspaceFilterUrlParam } from '@/modules/workspace/hooks/useWorkspaceFilterUrlParam';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface IWorkspaceTransactionsPageClientProps {
    /**
     * ID of the workspace.
     */
    workspaceId: string;
    /**
     * Number of transactions to display per page.
     */
    pageSize: number;
}

export const WorkspaceTransactionsPageClient: React.FC<
    IWorkspaceTransactionsPageClientProps
> = (props) => {
    const { workspaceId, pageSize } = props;

    const { t } = useTranslations();
    const { open } = useDialogContext();

    const { data: workspace } = useWorkspace({
        urlParams: { id: workspaceId },
    });

    const { activeOption, setActiveOption, options } =
        useWorkspaceFilterUrlParam({
            accounts: workspace?.accounts,
            name: workspaceAccountFilterParam,
        });

    const daoIds = workspace?.accounts.map((account) => account.id) ?? [];
    const allAccountsSelected = activeOption?.isAllAccounts ?? false;

    // The workspace-wide aside shows treasury totals, same as the DAO transactions page does.
    const { data: allAccountsStats } = useWorkspaceAssetList(
        { queryParams: { daoIds } },
        { enabled: allAccountsSelected },
    );

    // First page of the selected account, used for its transaction count and last activity on the aside.
    const { data: selectedTransactions } = useTransactionList(
        {
            queryParams: {
                daoId: activeOption?.daoId,
                onlyParent: activeOption?.onlyParent,
                pageSize,
            },
        },
        { enabled: !allAccountsSelected && activeOption?.daoId != null },
    );

    if (activeOption == null || options == null) {
        return null;
    }

    return (
        <Page.Content>
            <Page.Main
                title={t('app.workspace.workspaceTransactionsPage.main.title')}
            >
                <div className="flex flex-col gap-4 md:gap-6">
                    <WorkspaceAccountFilter
                        onSelect={setActiveOption}
                        options={options}
                        value={activeOption}
                    />
                    {activeOption.daoId == null ? (
                        <WorkspaceTransactionList
                            accounts={workspace?.accounts ?? []}
                            onTransactionClick={(transaction, dao) => {
                                // The detail dialog resolves actions against the owning DAO, so it stays closed
                                // until that DAO is available.
                                if (dao != null) {
                                    open(FinanceDialogId.TRANSACTION_DETAIL, {
                                        params: { dao, transaction },
                                    });
                                }
                            }}
                            pageSize={pageSize}
                        />
                    ) : (
                        <TransactionList.Default
                            dao={activeOption.dao}
                            initialParams={{
                                queryParams: {
                                    daoId: activeOption.daoId,
                                    onlyParent: activeOption.onlyParent,
                                    pageSize,
                                },
                            }}
                            onTransactionClick={(transaction) => {
                                if (activeOption.dao != null) {
                                    open(FinanceDialogId.TRANSACTION_DETAIL, {
                                        params: {
                                            dao: activeOption.dao,
                                            transaction,
                                        },
                                    });
                                }
                            }}
                        />
                    )}
                </div>
            </Page.Main>
            <Page.Aside>
                <WorkspaceFilterAsideCard
                    activeOption={activeOption}
                    allAccountsStats={allAccountsStats}
                    selectedMetadata={selectedTransactions?.pages[0]}
                    statsType="transactions"
                />
            </Page.Aside>
        </Page.Content>
    );
};
