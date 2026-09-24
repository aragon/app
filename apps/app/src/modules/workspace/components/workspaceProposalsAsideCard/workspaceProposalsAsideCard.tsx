'use client';

import type { IWorkspaceAccount } from '../../api/workspaceService';
import { WorkspaceAccountType } from '../../api/workspaceService';
import type { IWorkspaceAccountFilterOption } from '../../hooks/useWorkspaceAccountFilter';
import { WorkspaceAllProposalsAsideCard } from './workspaceAllProposalsAsideCard';
import { WorkspaceDaoProposalsAsideCard } from './workspaceDaoProposalsAsideCard';

export interface IWorkspaceProposalsAsideCardProps {
    /**
     * Account option selected on the page. The whole workspace is described when unset or set to the aggregated
     * option.
     */
    activeOption?: IWorkspaceAccountFilterOption;
    /**
     * DAO accounts of the workspace, i.e. what the aggregated option covers.
     */
    accounts: IWorkspaceAccount[];
    /**
     * Number of proposals the list next to the card reads per page. The stats are read under the same key, so both
     * must match for the card to add no request.
     */
    pageSize: number;
}

/**
 * Aside card of the workspace proposals page, picking the card matching the selected account.
 *
 * Each account type describes itself differently, so the card of a type is its own component: a DAO account shows
 * the same stats as the DAO proposals page, the aggregated option shows the stats that generalize across DAOs. A
 * new account type is added by branching on it here. Every card reads its own stats, under the same query key as
 * the list it stands next to.
 */
export const WorkspaceProposalsAsideCard: React.FC<
    IWorkspaceProposalsAsideCardProps
> = (props) => {
    const { activeOption, accounts, pageSize } = props;

    const account = activeOption?.account;

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
