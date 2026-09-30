'use client';

import { useRouter } from 'next/navigation';
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
 * Proposals of every account of a workspace, laid out like the DAO proposals page. The proposals of a single
 * account are an account-scoped page, which — the account being on its path — reads the DAO's own endpoint.
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

    const { data: workspace } = useWorkspace({
        urlParams: { id: workspaceId },
    });

    const accounts = workspace?.accounts ?? [];
    const daoAccounts = accounts.filter(
        (account: IWorkspaceAccount) =>
            account.type === WorkspaceAccountType.DAO,
    );

    const { activeOption } = useWorkspaceAccountOptions();

    const { daos } = useWorkspaceDaos(daoAccounts);

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

    // The page aggregates every account, so which one the proposal belongs to is always the first thing to ask.
    const handleCreateProposal = () => {
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
                <WorkspaceProposalList
                    accounts={daoAccounts}
                    pageSize={pageSize}
                />
            </Page.Main>
            <Page.Aside>
                <WorkspaceProposalsAsideCard
                    accounts={daoAccounts}
                    activeOption={activeOption}
                    pageSize={pageSize}
                />
            </Page.Aside>
        </Page.Content>
    );
};
