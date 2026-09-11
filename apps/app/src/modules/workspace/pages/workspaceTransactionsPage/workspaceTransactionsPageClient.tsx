'use client';

import { Card, EmptyState } from '@aragon/gov-ui-kit';
import { useMemo } from 'react';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFilterUrlParam } from '@/shared/hooks/useFilterUrlParam';
import type { IGetWorkspaceTransactionsParams } from '../../api/workspaceQueryService';
import { useWorkspaceAccounts } from '../../api/workspaceQueryService';
import { useWorkspace } from '../../api/workspaceService';
import { WorkspaceTransactionList } from '../../components/workspaceTransactionList';
import { workspaceUtils } from '../../utils/workspaceUtils';

export const workspaceTransactionsAccountFilterParam = 'account';

/**
 * Identifier of the account filter option that keeps every account of the workspace selected.
 */
const allAccountsOptionId = 'all';

/**
 * Number of accounts below which the account filter is not worth showing.
 */
const accountFilterMinAccounts = 2;

export interface IWorkspaceTransactionsPageClientProps {
    /**
     * ID of the workspace to display the transactions of.
     */
    workspaceId: string;
    /**
     * Initial parameters to use to fetch the workspace transactions. The accounts are omitted because they come
     * from the registry, which is only readable here on the client.
     */
    initialParams: Omit<IGetWorkspaceTransactionsParams, 'body'>;
}

export const WorkspaceTransactionsPageClient: React.FC<
    IWorkspaceTransactionsPageClientProps
> = (props) => {
    const { workspaceId, initialParams } = props;

    const { t } = useTranslations();

    const {
        data: workspace,
        isPending: isWorkspacePending,
        isError: isWorkspaceError,
    } = useWorkspace({ urlParams: { id: workspaceId } }, { retry: false });

    const accounts = useMemo(() => workspace?.accounts ?? [], [workspace]);

    // Resolved once for the whole filter to label the DAO accounts, whose names the registry does not store.
    const { data: accountInfos } = useWorkspaceAccounts(
        {
            body: {
                accounts: accounts.map(({ network, address }) => ({
                    network,
                    address,
                })),
            },
        },
        { enabled: accounts.length > 0 },
    );

    const options = useMemo(
        () => [
            {
                id: allAccountsOptionId,
                label: t(
                    'app.workspace.workspaceTransactionsPage.accountFilter.all',
                ),
            },
            ...accounts.map((account) => ({
                id: workspaceUtils.buildAccountId(account),
                label: workspaceUtils.getAccountLabel(
                    account,
                    workspaceUtils.findAccountInfo(accountInfos, account),
                ),
            })),
        ],
        [accounts, accountInfos, t],
    );

    const [activeOption, setActiveOption] = useFilterUrlParam({
        fallbackValue: allAccountsOptionId,
        name: workspaceTransactionsAccountFilterParam,
        validValues: options.map((option) => option.id),
    });

    const selectedAccounts =
        activeOption == null || activeOption === allAccountsOptionId
            ? accounts
            : accounts.filter(
                  (account) =>
                      workspaceUtils.buildAccountId(account) === activeOption,
              );

    // The filter only means something once there is more than one account to choose between.
    const accountFilter =
        accounts.length >= accountFilterMinAccounts && activeOption != null
            ? { options, value: activeOption, onSelect: setActiveOption }
            : undefined;

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
                <WorkspaceTransactionList
                    accountFilter={accountFilter}
                    accounts={selectedAccounts}
                    initialParams={initialParams}
                    isPending={isWorkspacePending}
                />
            </Page.Main>
        </Page.Content>
    );
};
