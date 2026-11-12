'use client';

import { useParams, useRouter } from 'next/navigation';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IWorkspacePageParams } from '@/shared/types';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import { WorkspaceAccountStateCard } from '../../components/workspaceAccountStateCard';
import { WorkspaceTransactionList } from '../../components/workspaceTransactionList';
import { WorkspaceTransactionsAsideCard } from '../../components/workspaceTransactionsAsideCard';
import { WorkspaceDialogId } from '../../constants/workspaceDialogId';
import type { IWorkspaceSelectAccountDialogParams } from '../../dialogs/workspaceSelectAccountDialog';
import { useWorkspaceAccountOptions } from '../../hooks/useWorkspaceAccountOptions';
import { useWorkspaceAccountsExecutePermission } from '../../hooks/useWorkspaceAccountsExecutePermission';
import { workspaceUtils } from '../../utils/workspaceUtils';

export interface IWorkspaceTransactionsPageClientProps {
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
    const { pageSize } = props;

    const { t } = useTranslations();
    const { open, close } = useDialogContext();
    const router = useRouter();
    const { workspaceId } =
        useParams<Pick<IWorkspacePageParams, 'workspaceId'>>();

    // Every account of the workspace, or just the one the route names, held by the workspace or not.
    const {
        activeOption,
        scopedAccounts: accountsToDisplay,
        isPending: isScopePending,
    } = useWorkspaceAccountOptions();

    // An account the workspace does not hold that the lookup could not place as a DAO or a Safe: there is nothing to
    // list, so the page says what the account is instead of an empty list.
    const isUnresolvedExternal =
        activeOption?.isExternal === true &&
        activeOption.account == null &&
        !isScopePending;

    const selectedAccount = activeOption?.account;

    const { permissions, isPending } =
        useWorkspaceAccountsExecutePermission(accountsToDisplay);

    // A DAO goes to the workspace's direct-execute wizard, which guards the account itself.
    // TODO(APP-1140): a Safe has no create wizard in the workspace yet.
    const getCreateTransactionUrl = (account: IWorkspaceAccount) =>
        account.type === WorkspaceAccountType.DAO
            ? workspaceUtils.getAccountScopeUrl(
                  workspaceId,
                  account.id,
                  'create/execute',
              )
            : undefined;

    const canCreateTransactionFor = (account: IWorkspaceAccount) =>
        permissions[account.id] === true &&
        getCreateTransactionUrl(account) != null;

    const handleAccountSelected = (account: IWorkspaceAccount) => {
        const createTransactionUrl = getCreateTransactionUrl(account);

        if (createTransactionUrl == null) {
            return;
        }

        close(WorkspaceDialogId.SELECT_ACCOUNT);
        router.push(createTransactionUrl);
    };

    const handleCreateTransaction = () => {
        const params: IWorkspaceSelectAccountDialogParams = {
            accounts: accountsToDisplay,
            onAccountSelected: handleAccountSelected,
            variant: 'transaction',
            disabledAccountIds: accountsToDisplay
                .filter((account) => !canCreateTransactionFor(account))
                .map((account) => account.id),
        };
        open(WorkspaceDialogId.SELECT_ACCOUNT, { params });
    };

    const actionLabel = t(
        'app.workspace.workspaceTransactionsPage.main.action',
    );

    const scopedCreateUrl =
        selectedAccount != null && canCreateTransactionFor(selectedAccount)
            ? getCreateTransactionUrl(selectedAccount)
            : undefined;

    const scopedAction =
        scopedCreateUrl != null
            ? { label: actionLabel, href: scopedCreateUrl }
            : undefined;

    const aggregatedAction = accountsToDisplay.some((account) =>
        canCreateTransactionFor(account),
    )
        ? { label: actionLabel, onClick: handleCreateTransaction }
        : undefined;

    const action = selectedAccount != null ? scopedAction : aggregatedAction;

    if (isUnresolvedExternal) {
        return (
            <Page.Content>
                <Page.Main
                    title={t(
                        'app.workspace.workspaceTransactionsPage.main.title',
                    )}
                >
                    <WorkspaceAccountStateCard
                        accountState={activeOption.accountState}
                    />
                </Page.Main>
            </Page.Content>
        );
    }

    return (
        <Page.Content>
            <Page.Main
                action={isPending ? undefined : action}
                title={t('app.workspace.workspaceTransactionsPage.main.title')}
            >
                <WorkspaceTransactionList
                    accounts={accountsToDisplay}
                    isPending={isScopePending}
                    pageSize={pageSize}
                />
            </Page.Main>
            <Page.Aside>
                {!isScopePending && (
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
