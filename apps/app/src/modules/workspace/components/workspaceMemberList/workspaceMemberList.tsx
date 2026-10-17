'use client';

import { daoMemberListFilterParam } from '@/modules/governance/components/daoMemberList';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { PluginFilterComponent } from '@/shared/components/pluginFilterComponent';
import { PluginType } from '@/shared/types';
import type { IWorkspaceMemberListFilters } from '../../api/workspaceQueryService';
import type { IWorkspaceAccount } from '../../api/workspaceService';
import {
    type IWorkspaceMemberTabProps,
    useWorkspaceMemberTabs,
} from '../../hooks/useWorkspaceMemberTabs';
import { useWorkspacePlugins } from '../../hooks/useWorkspacePlugins';
import { WorkspaceMemberListDefault } from './workspaceMemberListDefault';

export interface IWorkspaceMemberListProps {
    /**
     * ID of the workspace, used to link each member to the members page of its account.
     */
    workspaceId: string;
    /**
     * Accounts to aggregate the members of, DAOs and Safes alike.
     */
    accounts: IWorkspaceAccount[];
    /**
     * Number of members to read per page.
     */
    pageSize: number;
}

/**
 * Aggregated member list of a workspace, filtered by tabs corresponding to the governance bodies of the accounts:
 * one "all" tab followed by one tab for every visible body of every account
 *
 * The strip's entries come from `useWorkspaceMemberTabs`, group tab included, and the page reads the same hook to
 * hand the selected body to the aside card, so the card beside the list describes whatever the list is filtered
 * to. This component owns the URL parameter through its `PluginFilterComponent`; every other reader of the hook
 * only reads it.
 *
 * Linked-account bodies are left out, as the endpoint only returns the members of the selected accounts.
 *
 * TODO: the "all" tab and the aside card beside it still count the members of hidden bodies. Hiding is a CMS
 * notion the endpoint knows nothing about, and its filters cannot express the exclusion: one `governanceAddress`
 * on one `network`, where a workspace spans several of both — it needs a per-account selection. Fanning out one
 * request per body is no way around it, as it would break the pagination and the `totalRecords` the aside shares
 * through `buildWorkspaceMemberListParams`. The same gap applies to the aggregated proposals page. Until then only
 * the rows' links are corrected: a member of hidden bodies only points at the block explorer.
 */
export const WorkspaceMemberList: React.FC<IWorkspaceMemberListProps> = (
    props,
) => {
    const { workspaceId, accounts, pageSize } = props;

    const { filterTabs, hasTabs, activeTab } = useWorkspaceMemberTabs({
        accounts,
    });

    // The plugins the rows are built from: the bodies to pick a membership from, and the processes to name the one
    // the chosen body acts through. The bodies are read as `useWorkspaceMemberTabs` reads them, sub-plugins and
    // all, so the rows cannot link a member through a body the strip does not offer. The read is shared with the
    // tabs' own, so it costs no request.
    const { plugins: bodyPlugins } = useWorkspacePlugins({
        accounts,
        type: PluginType.BODY,
        includeSubPlugins: true,
    });
    const { plugins: processPlugins } = useWorkspacePlugins({
        accounts,
        type: PluginType.PROCESS,
    });

    const processesByAccountId = new Map(
        processPlugins.map(({ accountId, plugins: daoPlugins }) => [
            accountId,
            daoPlugins,
        ]),
    );

    // Only the accounts whose plugins are known are listed
    const visiblePluginsByAccountId = Object.fromEntries(
        bodyPlugins.map(({ accountId, plugins: daoPlugins }) => [
            accountId,
            {
                bodies: daoPlugins,
                processes: processesByAccountId.get(accountId),
            },
        ]),
    );

    const renderList = (filters?: IWorkspaceMemberListFilters) => (
        <WorkspaceMemberListDefault
            accounts={accounts}
            filters={filters}
            pageSize={pageSize}
            visiblePluginsByAccountId={visiblePluginsByAccountId}
            workspaceId={workspaceId}
        />
    );

    // The tabs are only rendered if there is more than one, otherwise
    // the list is rendered directly with the filters
    if (!hasTabs) {
        return renderList(activeTab?.props.filters);
    }

    return (
        <PluginFilterComponent<IDaoPlugin, IWorkspaceMemberTabProps>
            plugins={filterTabs}
            renderContent={(plugin) => renderList(plugin.props.filters)}
            searchParamName={daoMemberListFilterParam}
        />
    );
};
