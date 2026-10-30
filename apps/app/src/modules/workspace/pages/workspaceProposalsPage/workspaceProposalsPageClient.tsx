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
    WorkspaceAccountType,
} from '../../api/workspaceService';
import { WorkspaceAccountStateCard } from '../../components/workspaceAccountStateCard';
import { WorkspaceProposalList } from '../../components/workspaceProposalList';
import { WorkspaceProposalsAsideCard } from '../../components/workspaceProposalsAsideCard';
import { WorkspaceDialogId } from '../../constants/workspaceDialogId';
import type { IWorkspaceSelectAccountDialogParams } from '../../dialogs/workspaceSelectAccountDialog';
import { useWorkspaceAccountOptions } from '../../hooks/useWorkspaceAccountOptions';
import { useWorkspaceDaos } from '../../hooks/useWorkspaceDaos';
import { useWorkspaceProposalTabs } from '../../hooks/useWorkspaceProposalTabs';

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
 *
 * A Safe never reaches this client on an account-scoped route: `WorkspaceProposalsPage` wraps that route in
 * `WorkspaceAccountGate`, so the narrowing below only ever sees a DAO or the aggregated selection. That gate is
 * load-bearing because the narrowing keeps DAO accounts only, so a Safe would be answered for with an empty list
 * instead of failing. See "Safe support by route" in `docs/projectDocs/createWorkspace.md`.
 *
 * The gate only proves that the DAO loads on the server; an account the workspace does not hold is still resolved
 * on the client, so the list loads until that lookup settles, and a lookup that cannot place the account renders
 * its state instead of an empty list, as on the assets and transactions pages.
 */
export const WorkspaceProposalsPageClient: React.FC<
    IWorkspaceProposalsPageClientProps
> = (props) => {
    const { workspaceId, pageSize } = props;

    const { t } = useTranslations();
    const { open, close } = useDialogContext();
    const router = useRouter();

    // `scopedAccounts` holds every account of the workspace, or just the one the route names, held by the workspace
    // or not. `activeOption` resolves the route account by network and address, so any casing of the ID lands on it.
    const {
        activeOption,
        scopedAccounts,
        isPending: isScopePending,
    } = useWorkspaceAccountOptions();

    // An account the workspace does not hold that the lookup could not place as a DAO or a Safe: there is nothing to
    // list, so the page says what the account is instead of an empty list.
    const isUnresolvedExternal =
        activeOption?.isExternal === true &&
        activeOption.account == null &&
        !isScopePending;

    // TEMPORARY narrowing: only DAO accounts have proposals, so a Safe scope narrows to nothing, which is why the
    // account-scoped route is gated in `WorkspaceProposalsPage`. When Safe proposals land, keep the route's account
    // whatever its type and drop that gate wrap — both halves together, or the route answers for a Safe with an
    // empty list instead of failing.
    const accountsToDisplay = scopedAccounts.filter(
        (account: IWorkspaceAccount) =>
            account.type === WorkspaceAccountType.DAO,
    );

    const scopedAccount =
        activeOption?.isAllAccounts === false
            ? accountsToDisplay[0]
            : undefined;

    const { daos, isPending: isDaosPending } =
        useWorkspaceDaos(accountsToDisplay);

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
            accounts: accountsToDisplay,
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

    if (isUnresolvedExternal) {
        return (
            <Page.Content>
                <Page.Main
                    title={t('app.workspace.workspaceProposalsPage.main.title')}
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
                action={isScopePending || isDaosPending ? undefined : action}
                title={t('app.workspace.workspaceProposalsPage.main.title')}
            >
                <WorkspaceProposalList
                    accounts={accountsToDisplay}
                    isAccountScoped={scopedAccount != null}
                    isPending={isScopePending}
                    pageSize={pageSize}
                    workspaceId={workspaceId}
                />
            </Page.Main>
            <Page.Aside>
                <WorkspaceProposalsAsideCard
                    accounts={accountsToDisplay}
                    activeOption={activeOption}
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
