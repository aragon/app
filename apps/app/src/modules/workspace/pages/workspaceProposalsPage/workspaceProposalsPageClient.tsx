'use client';

import { useRouter } from 'next/navigation';
import { TelegramSubscriptionCard } from '@/modules/dashboard/components/telegramSubscriptionCard';
import { GovernanceDialogId } from '@/modules/governance/constants/governanceDialogId';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import type { ISelectPluginDialogParams } from '@/modules/governance/dialogs/selectPluginDialog';
import { usePermissionCheckGuard } from '@/modules/governance/hooks/usePermissionCheckGuard';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
import {
    type IWorkspaceAccount,
    useWorkspace,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import { WorkspaceProposalList } from '../../components/workspaceProposalList';
import { WorkspaceProposalsAsideCard } from '../../components/workspaceProposalsAsideCard';
import { WorkspaceDialogId } from '../../constants/workspaceDialogId';
import type { IWorkspaceSelectAccountDialogParams } from '../../dialogs/workspaceSelectAccountDialog';
import { useWorkspaceAccountOptions } from '../../hooks/useWorkspaceAccountOptions';
import { useWorkspaceDaos } from '../../hooks/useWorkspaceDaos';
import { useWorkspaceProposalTabs } from '../../hooks/useWorkspaceProposalTabs';
import { workspaceUtils } from '../../utils/workspaceUtils';

export interface IWorkspaceProposalsPageClientProps {
    /**
     * ID of the workspace.
     */
    workspaceId: string;
    /**
     * Number of proposals to read per page.
     */
    pageSize: number;
}

/**
 * Proposals of a workspace, scoped to the account on the route, laid out like the DAO proposals page.
 *
 * One page serves both scopes, as the assets and transactions pages do: every scope reads the same workspace
 * proposals endpoint, so a single account sums into the aggregated view.
 * The plugin tabs and the aside card follow from that selection on their own.
 */
export const WorkspaceProposalsPageClient: React.FC<
    IWorkspaceProposalsPageClientProps
> = (props) => {
    const { workspaceId, pageSize } = props;

    const { t } = useTranslations();
    const { open, close } = useDialogContext();
    const router = useRouter();

    const { data: workspace } = useWorkspace({
        urlParams: { id: workspaceId },
    });

    const accounts = workspace?.accounts ?? [];
    const daoAccounts = accounts.filter(
        (account: IWorkspaceAccount) =>
            account.type === WorkspaceAccountType.DAO,
    );

    const { accountId, options, activeOption } = useWorkspaceAccountOptions();

    // Resolved from the route rather than from `activeOption`, which is matched on the exact ID string: a shared
    // link carrying a lowercased address would otherwise widen the page to every account under a URL naming one.
    const routeAccount = workspaceUtils.findAccountById(accounts, accountId);

    // Only a DAO has proposals, so the route of a Safe falls back to every DAO account, as the transactions page
    // does. A Safe never becomes an account option either, so the aside falls back with it.
    const scopedAccount =
        routeAccount?.type === WorkspaceAccountType.DAO
            ? routeAccount
            : undefined;

    const accountsToDisplay =
        scopedAccount != null ? [scopedAccount] : daoAccounts;

    // The option of the scoped account, which titles the aside card. Looked up by the resolved account rather than
    // read off `activeOption`, so a lowercased address in the URL still names its account on the aside.
    const scopedOption =
        scopedAccount != null
            ? options.find((option) => option.account?.id === scopedAccount.id)
            : undefined;

    const { daos } = useWorkspaceDaos(accountsToDisplay);

    // The single reader of the selection: the list renders the tabs and owns the URL parameter, while the aside
    // card is handed the selected tab from here, so the two cannot describe different tabs.
    const { activeTab } = useWorkspaceProposalTabs({
        accounts: accountsToDisplay,
    });

    // A Telegram subscription is bound to one DAO, so the card appears only when exactly one is in view: the DAO a
    // selected process belongs to, or the only account on display — which is the account the route names, and also
    // a workspace holding a single DAO on its aggregated route.
    const notificationsAccountId =
        activeTab?.accountId ??
        (accountsToDisplay.length === 1 ? accountsToDisplay[0].id : undefined);

    // A single guard instance serves every DAO: the hook freezes its own `plugin` in a ref, but `check` merges the
    // parameters it is called with, and the permission dialog resolves the check from those.
    const { check: createProposalGuard } = usePermissionCheckGuard({
        permissionNamespace: 'proposal',
        slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION,
        daoId: '',
    });

    const handlePluginSelected = (
        account: IWorkspaceAccount,
        plugin: IDaoPlugin,
    ) => {
        const dao = daos[account.id];

        createProposalGuard({
            plugin,
            daoId: account.id,
            onSuccess: () => {
                const createProposalUrl = daoUtils.getDaoUrl(
                    dao,
                    `create/${plugin.address}/proposal`,
                );

                if (createProposalUrl != null) {
                    router.push(createProposalUrl);
                }
            },
        });
    };

    // Second step of the flow, stacked on top of the account step when there is one so that its back action pops
    // only this dialog and reveals the account selection again.
    const openSelectPluginDialog = (
        account: IWorkspaceAccount,
        hasAccountStep: boolean,
    ) => {
        const params: ISelectPluginDialogParams = {
            daoId: account.id,
            variant: 'process',
            onPluginSelected: (plugin) => handlePluginSelected(account, plugin),
            onBack: hasAccountStep
                ? () => close(GovernanceDialogId.SELECT_PLUGIN)
                : undefined,
        };
        open(GovernanceDialogId.SELECT_PLUGIN, {
            params,
            stack: hasAccountStep,
        });
    };

    const handleCreateProposal = () => {
        if (scopedAccount != null) {
            openSelectPluginDialog(scopedAccount, false);

            return;
        }

        const params: IWorkspaceSelectAccountDialogParams = {
            accounts: daoAccounts,
            onAccountSelected: (account) =>
                openSelectPluginDialog(account, true),
            variant: 'proposal',
        };
        open(WorkspaceDialogId.SELECT_ACCOUNT, { params });
    };

    const action =
        accountsToDisplay.length > 0
            ? {
                  label: t('app.workspace.workspaceProposalsPage.main.action'),
                  onClick: handleCreateProposal,
              }
            : undefined;

    return (
        <Page.Content>
            <Page.Main
                action={action}
                title={t('app.workspace.workspaceProposalsPage.main.title')}
            >
                <WorkspaceProposalList
                    accounts={accountsToDisplay}
                    isAccountScoped={scopedAccount != null}
                    pageSize={pageSize}
                />
            </Page.Main>
            <Page.Aside>
                <WorkspaceProposalsAsideCard
                    accounts={accountsToDisplay}
                    activeOption={scopedOption ?? activeOption}
                    activeTab={activeTab}
                    pageSize={pageSize}
                />
                {notificationsAccountId != null && (
                    <TelegramSubscriptionCard daoId={notificationsAccountId} />
                )}
            </Page.Aside>
        </Page.Content>
    );
};
