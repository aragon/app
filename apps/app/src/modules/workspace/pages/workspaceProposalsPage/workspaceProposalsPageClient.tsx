'use client';

import { DaoProposalList } from '@/modules/governance/components/daoProposalList';
import { ProposalListStats } from '@/modules/governance/components/proposalListStats';
import { useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useWorkspaceAccounts } from '../../api/workspaceQueryService';
import {
    type IWorkspaceAccount,
    useWorkspace,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import { WorkspaceAccountDropdown } from '../../components/workspaceAccountFilter';
import { WorkspaceProposalList } from '../../components/workspaceProposalList';
import { WorkspaceProposalsAsideCard } from '../../components/workspaceProposalsAsideCard';
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

    const { isPending: isDaosPending } = useWorkspaceDaos(daoAccounts);

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

    return (
        <Page.Content>
            <Page.Main
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
