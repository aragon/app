'use client';

import { useRouter } from 'next/navigation';
import { DaoProposalList } from '@/modules/governance/components/daoProposalList';
import { ProposalListStats } from '@/modules/governance/components/proposalListStats';
import { GovernanceDialogId } from '@/modules/governance/constants/governanceDialogId';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import type { ISelectPluginDialogParams } from '@/modules/governance/dialogs/selectPluginDialog';
import { usePermissionCheckGuard } from '@/modules/governance/hooks/usePermissionCheckGuard';
import { type IDaoPlugin, useDao } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
import { useWorkspaceAccounts } from '../../api/workspaceQueryService';
import {
    type IWorkspaceAccount,
    useWorkspace,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import { WorkspaceAccountDropdown } from '../../components/workspaceAccountFilter';
import { WorkspaceProposalList } from '../../components/workspaceProposalList';
import { WorkspaceProposalsAsideCard } from '../../components/workspaceProposalsAsideCard';
import { WorkspaceDialogId } from '../../constants/workspaceDialogId';
import type { IWorkspaceSelectAccountDialogParams } from '../../dialogs/workspaceSelectAccountDialog';
import { useWorkspaceAccountFilter } from '../../hooks/useWorkspaceAccountFilter';
import { useWorkspaceDaos } from '../../hooks/useWorkspaceDaos';
import { useWorkspaceProposalListData } from '../../hooks/useWorkspaceProposalListData';

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
 * Proposals of a workspace, laid out like the DAO proposals page: one tab per DAO account plus an aggregated one.
 *
 * Only DAO accounts take part. Safe accounts have no indexed proposals — they only contribute queued transactions,
 * which the endpoint returns in a separate `pending` block that this page does not render.
 */
export const WorkspaceProposalsPageClient: React.FC<
    IWorkspaceProposalsPageClientProps
> = (props) => {
    const { workspaceId, pageSize } = props;

    const { t } = useTranslations();
    const { open, close } = useDialogContext();
    const router = useRouter();

    const { data: workspace } = useWorkspace(
        { urlParams: { id: workspaceId } },
        { retry: false },
    );

    const accounts = workspace?.accounts ?? [];
    const daoAccounts = accounts.filter(
        (account: IWorkspaceAccount) =>
            account.type === WorkspaceAccountType.DAO,
    );
    const daoAccountRefs = daoAccounts.map(({ network, address }) => ({
        network,
        address,
    }));

    // Resolved once to label the tabs with the indexed DAO names, shared with the other workspace pages' cache.
    const { data: accountInfos } = useWorkspaceAccounts(
        { body: { accounts: daoAccountRefs } },
        { enabled: accounts.length > 0 },
    );

    const { activeOption, setActiveOption, options } =
        useWorkspaceAccountFilter({
            accounts,
            accountInfos,
            allAccountsLabel: t(
                'app.workspace.workspaceProposalsPage.filter.allAccounts',
            ),
        });

    const isAllAccountsSelected = activeOption?.isAllAccounts ?? true;

    const { daos, isPending: isDaosPending } = useWorkspaceDaos(daoAccounts);

    // Totals of the aggregated view. Shares its key with the list's own query, so this adds no extra request.
    const { metadata, proposalList } = useWorkspaceProposalListData({
        params: {
            body: { accounts: daoAccountRefs, pagination: { pageSize } },
        },
        isDaosPending,
        enabled: isAllAccountsSelected && daoAccounts.length > 0,
    });

    const selectedAccount = activeOption?.account;

    // The account tabs show the DAO's own stats, the same ones the DAO proposals page shows.
    const { data: selectedDao } = useDao(
        { urlParams: { id: selectedAccount?.id ?? '' } },
        { enabled: selectedAccount != null },
    );

    const selectedDaoParams = {
        queryParams: {
            daoId: selectedAccount?.id ?? '',
            pageSize,
            sort: 'blockTimestamp',
            isSubProposal: false,
            includeLinkedAccounts: false,
        },
    };

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
        // The account step has nothing to ask when the page is already filtered down to a single account.
        if (selectedAccount != null) {
            openSelectPluginDialog(selectedAccount, false);

            return;
        }

        const params: IWorkspaceSelectAccountDialogParams = {
            accounts: daoAccounts,
            onAccountSelected: (account) =>
                openSelectPluginDialog(account, true),
        };
        open(WorkspaceDialogId.SELECT_ACCOUNT, { params });
    };

    return (
        <Page.Content>
            <Page.Main
                action={
                    daoAccounts.length > 0
                        ? {
                              label: t(
                                  'app.workspace.workspaceProposalsPage.main.action',
                              ),
                              onClick: handleCreateProposal,
                          }
                        : undefined
                }
                title={t('app.workspace.workspaceProposalsPage.main.title')}
            >
                <div className="flex flex-col gap-4 md:gap-6">
                    <WorkspaceAccountDropdown
                        onSelect={setActiveOption}
                        options={options}
                        value={activeOption}
                    />
                    {isAllAccountsSelected ? (
                        <WorkspaceProposalList
                            accounts={daoAccounts}
                            pageSize={pageSize}
                        />
                    ) : (
                        <DaoProposalList initialParams={selectedDaoParams} />
                    )}
                </div>
            </Page.Main>
            <Page.Aside>
                {isAllAccountsSelected ? (
                    <WorkspaceProposalsAsideCard
                        daosCount={daoAccounts.length}
                        mostRecentTimestamp={proposalList[0]?.blockTimestamp}
                        proposalsCount={metadata?.totalRecords}
                        title={
                            activeOption?.label ??
                            t(
                                'app.workspace.workspaceProposalsPage.filter.allAccounts',
                            )
                        }
                    />
                ) : (
                    selectedDao != null && (
                        <Page.AsideCard title={activeOption?.label ?? ''}>
                            <ProposalListStats
                                dao={selectedDao}
                                initialParams={selectedDaoParams}
                            />
                        </Page.AsideCard>
                    )
                )}
            </Page.Aside>
        </Page.Content>
    );
};
