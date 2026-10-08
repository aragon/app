'use client';

import { useRouter } from 'next/navigation';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
import {
    type IWorkspaceAccount,
    useWorkspace,
} from '../../api/workspaceService';
import { WorkspaceTransactionList } from '../../components/workspaceTransactionList';
import { WorkspaceTransactionsAsideCard } from '../../components/workspaceTransactionsAsideCard';
import { WorkspaceDialogId } from '../../constants/workspaceDialogId';
import type { IWorkspaceSelectAccountDialogParams } from '../../dialogs/workspaceSelectAccountDialog';
import { useWorkspaceAccountOptions } from '../../hooks/useWorkspaceAccountOptions';
import { useWorkspaceAccountsExecutePermission } from '../../hooks/useWorkspaceAccountsExecutePermission';
import { useWorkspaceDaos } from '../../hooks/useWorkspaceDaos';

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
    const { open, close } = useDialogContext();
    const router = useRouter();

    const { data: workspace, isPending: isWorkspacePending } = useWorkspace({
        urlParams: { id: workspaceId },
    });

    const { activeOption } = useWorkspaceAccountOptions();

    const accounts = workspace?.accounts ?? [];

    const selectedAccount = activeOption?.account;
    const accountsToDisplay =
        selectedAccount != null ? [selectedAccount] : accounts;

    const { daos } = useWorkspaceDaos(accountsToDisplay);
    const { permissions } =
        useWorkspaceAccountsExecutePermission(accountsToDisplay);

    // TODO(APP-1140): the workspace has no create routes of its own yet, so the destination is the create wizard of
    // the account itself. A Safe account will need a destination of its own, which `getDaoUrl` cannot name.
    const getCreateTransactionUrl = (account: IWorkspaceAccount) =>
        daoUtils.getDaoUrl(daos[account.id], 'create/execute');

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

    return (
        <Page.Content>
            <Page.Main
                action={action}
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
