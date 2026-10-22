'use client';

import { daoProposalListFilterParam } from '@/modules/governance/components/daoProposalList';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { PluginFilterComponent } from '@/shared/components/pluginFilterComponent';
import type { IWorkspaceProposalListFilters } from '../../api/workspaceQueryService';
import type { IWorkspaceAccount } from '../../api/workspaceService';
import { useWorkspaceDaos } from '../../hooks/useWorkspaceDaos';
import {
    type IWorkspaceProposalTabProps,
    useWorkspaceProposalTabs,
} from '../../hooks/useWorkspaceProposalTabs';
import { WorkspaceProposalListDefault } from './workspaceProposalListDefault';

export interface IWorkspaceProposalListProps {
    /**
     * DAO accounts to aggregate the proposals of.
     */
    accounts: IWorkspaceAccount[];
    /**
     * Number of proposals to read per page.
     */
    pageSize: number;
    /**
     * Whether the page is scoped to a single account, which the empty and error copy then names.
     */
    isAccountScoped?: boolean;
    /**
     * ID of the workspace, used to link each row to the proposal details page of its account.
     */
    workspaceId: string;
}

/**
 * Aggregated proposal list of a workspace, filtered by tabs like `DaoProposalList` of the DAO pages: one "all" tab
 * followed by one tab for every visible process plugin of every DAO, grouped by DAO in the order of the accounts.
 *
 * The strip's entries come from `useWorkspaceProposalTabs`, group tab included, and the page reads the same hook
 * to hand the selected process to the aside card, so the card beside the list describes whatever the list is
 * filtered to. This component owns the URL parameter through its `PluginFilterComponent`; every other reader of
 * the hook only reads it.
 *
 * Linked-account plugins are left out, as the endpoint only returns the proposals of the selected accounts.
 */
export const WorkspaceProposalList: React.FC<IWorkspaceProposalListProps> = (
    props,
) => {
    const { accounts, pageSize, isAccountScoped, workspaceId } = props;

    const { filterTabs, hasTabs } = useWorkspaceProposalTabs({ accounts });

    // The rows need the real DAOs to be linkable and titled, which the tabs do not, so they are read here rather
    // than handed down from the tab derivation. The queries are shared with the page's own reader, so this adds no
    // request of its own.
    const { daos, isPending: isDaosPending } = useWorkspaceDaos(accounts);

    const renderList = (filters?: IWorkspaceProposalListFilters) => (
        <WorkspaceProposalListDefault
            accounts={accounts}
            daos={daos}
            filters={filters}
            isAccountScoped={isAccountScoped}
            isDaosPending={isDaosPending}
            pageSize={pageSize}
            workspaceId={workspaceId}
        />
    );

    if (!hasTabs) {
        return renderList();
    }

    return (
        <PluginFilterComponent<IDaoPlugin, IWorkspaceProposalTabProps>
            plugins={filterTabs}
            renderContent={(plugin) => renderList(plugin.props.filters)}
            searchParamName={daoProposalListFilterParam}
        />
    );
};
