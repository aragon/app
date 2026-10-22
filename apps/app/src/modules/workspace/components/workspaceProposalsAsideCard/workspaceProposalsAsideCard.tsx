'use client';

import type { IWorkspaceAccount } from '../../api/workspaceService';
import { WorkspaceAccountType } from '../../api/workspaceService';
import type { IWorkspaceAccountOption } from '../../hooks/useWorkspaceAccountOptions';
import type { IWorkspaceProposalTab } from '../../hooks/useWorkspaceProposalTabs';
import { WorkspaceAllProposalsAsideCard } from './workspaceAllProposalsAsideCard';
import { WorkspaceDaoProposalsAsideCard } from './workspaceDaoProposalsAsideCard';
import { WorkspaceProcessProposalsAsideCard } from './workspaceProcessProposalsAsideCard';

export interface IWorkspaceProposalsAsideCardProps {
    /**
     * Account option the page is scoped to. The whole workspace is described when unset or set to the aggregated
     * option.
     */
    activeOption?: IWorkspaceAccountOption;
    /**
     * Process tab selected on the page, which the card describes in preference to the scope. Comes from the page
     * rather than from `useWorkspaceProposalTabs` here, so the card cannot name a different tab than the list does.
     */
    activeTab?: IWorkspaceProposalTab;
    /**
     * DAO accounts in view, i.e. what the aggregated option covers.
     */
    accounts: IWorkspaceAccount[];
    /**
     * Number of proposals the list next to the card reads per page. The aggregated card reads the totals out of the
     * list's own response, so both must match for it to add no request.
     */
    pageSize: number;
}

/**
 * Aside card of the workspace proposals page, picking the card matching what the list beside it shows.
 *
 * A process tab wins over the account scope: it narrows the list to one process of one account, so the card
 * describes that process whichever scope the route names — the same swap `daoProposalsPageClient` makes. Otherwise
 * each account type describes itself differently, so the card of a type is its own component: a DAO account shows
 * the same stats as the DAO proposals page, the aggregated option shows the stats that generalize across DAOs. A
 * new account type is added by branching on it here.
 */
export const WorkspaceProposalsAsideCard: React.FC<
    IWorkspaceProposalsAsideCardProps
> = (props) => {
    const { activeOption, activeTab, accounts, pageSize } = props;

    const account = activeOption?.account;

    if (activeTab != null) {
        return <WorkspaceProcessProposalsAsideCard tab={activeTab} />;
    }

    if (activeOption != null && account?.type === WorkspaceAccountType.DAO) {
        return (
            <WorkspaceDaoProposalsAsideCard
                account={account}
                label={activeOption.label}
                pageSize={pageSize}
            />
        );
    }

    // Only DAO accounts get an option of their own, so anything else describes the whole workspace.
    return (
        <WorkspaceAllProposalsAsideCard
            accounts={accounts}
            pageSize={pageSize}
            title={activeOption?.label}
        />
    );
};
