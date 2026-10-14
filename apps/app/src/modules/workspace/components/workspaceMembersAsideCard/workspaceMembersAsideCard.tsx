'use client';

import type { IWorkspaceAccount } from '../../api/workspaceService';
import type { IWorkspaceAccountOption } from '../../hooks/useWorkspaceAccountOptions';
import type { IWorkspaceMemberTab } from '../../hooks/useWorkspaceMemberTabs';
import { WorkspaceAllMembersAsideCard } from './workspaceAllMembersAsideCard';
import { WorkspaceBodyMembersAsideCard } from './workspaceBodyMembersAsideCard';

export interface IWorkspaceMembersAsideCardProps {
    /**
     * Account option selected on the page, whose label titles the aggregated card.
     */
    activeOption?: IWorkspaceAccountOption;
    /**
     * Body tab selected on the page, which the card describes in preference to the aggregate. Comes from the page
     * rather than from `useWorkspaceMemberTabs` here, so the card cannot name a different tab than the list does.
     */
    activeTab?: IWorkspaceMemberTab;
    /**
     * Accounts the members are read from, i.e. what the aggregated option covers.
     */
    accounts: IWorkspaceAccount[];
    /**
     * Number of members the list next to the card reads per page. The aggregated card reads the totals out of the
     * list's own response, so both must match for it to add no request.
     */
    pageSize: number;
}

/**
 * Aside card of the workspace members page, picking the card matching what the list beside it shows.
 *
 * A selected body wins over the aggregate: it narrows the list to one body of one account, so the card describes
 * that body — the swap `daoMembersPageClient` makes, and the same shape `WorkspaceProposalsAsideCard` has for a
 * selected process.
 */
export const WorkspaceMembersAsideCard: React.FC<
    IWorkspaceMembersAsideCardProps
> = (props) => {
    const { activeOption, activeTab, accounts, pageSize } = props;

    if (activeTab != null) {
        return <WorkspaceBodyMembersAsideCard tab={activeTab} />;
    }

    return (
        <WorkspaceAllMembersAsideCard
            accounts={accounts}
            activeOption={activeOption}
            pageSize={pageSize}
        />
    );
};
