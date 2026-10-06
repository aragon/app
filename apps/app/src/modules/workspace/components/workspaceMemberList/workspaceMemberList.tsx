'use client';

import { daoMemberListFilterParam } from '@/modules/governance/components/daoMemberList';
import type { IDaoPlugin } from '@/shared/api/daoService';
import {
    type IFilterComponentPlugin,
    PluginFilterComponent,
} from '@/shared/components/pluginFilterComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { pluginGroupFilter } from '@/shared/hooks/useDaoPlugins';
import { PluginType } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { pluginSortUtils } from '@/shared/utils/pluginSortUtils';
import type { IWorkspaceMemberListFilters } from '../../api/workspaceQueryService';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
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

interface IWorkspaceMemberListTabProps {
    /**
     * Filters narrowing the members to the governance of the tab, unset for the group tab.
     */
    filters?: IWorkspaceMemberListFilters;
}

type IWorkspaceMemberListTab = IFilterComponentPlugin<
    IDaoPlugin,
    IWorkspaceMemberListTabProps
>;

/**
 * Aggregated member list of a workspace, filtered by tabs corresponding to the governance bodies of the accounts:
 * one "all" tab followed by one tab for every visible body of every account
 *
 * Linked-account bodies are left out, as the endpoint only returns the members of the selected accounts.
 */
export const WorkspaceMemberList: React.FC<IWorkspaceMemberListProps> = (
    props,
) => {
    const { workspaceId, accounts, pageSize } = props;

    const { t } = useTranslations();

    // Sub-plugins are included, as `DaoMemberListContainer` does: the bodies nested in a process hold members of
    // their own, and they sit on a selected account, so the endpoint returns them.
    const { isPending: isDaosPending, plugins } = useWorkspacePlugins({
        accounts,
        type: PluginType.BODY,
        includeSubPlugins: true,
    });

    const daoPluginsByAccountId = new Map(
        plugins.map((daoPlugins) => [daoPlugins.accountId, daoPlugins]),
    );

    /**
     * Tabs of a DAO account: one per visible body, in display order. Empty for a DAO that could not be read, and
     * for one whose bodies are all hidden.
     */
    const buildDaoTabs = (
        account: IWorkspaceAccount,
    ): IWorkspaceMemberListTab[] => {
        const daoPlugins = daoPluginsByAccountId.get(account.id);

        if (daoPlugins == null) {
            return [];
        }

        const { dao } = daoPlugins;

        const tabs: IWorkspaceMemberListTab[] = daoPlugins.plugins.map(
            (plugin) => ({
                id: plugin.interfaceType,
                uniqueId: `${dao.network}-${plugin.address}-${plugin.slug}`,
                label: t('app.workspace.workspaceMemberList.pluginTab', {
                    dao: daoUtils.getDaoDisplayName(dao),
                    plugin: daoUtils.getPluginName(plugin),
                }),
                meta: plugin,
                props: {
                    filters: {
                        network: dao.network,
                        governanceAddress: plugin.address,
                    },
                },
            }),
        );

        return pluginSortUtils.sortByDisplayOrder(tabs, {
            rootDaoAddress: dao.address,
        });
    };

    const accountTabs = accounts.map((account) =>
        account.type === WorkspaceAccountType.DAO ? buildDaoTabs(account) : [],
    );

    const tabs = accountTabs.flat();

    const renderList = (filters?: IWorkspaceMemberListFilters) => (
        <WorkspaceMemberListDefault
            accounts={accounts}
            filters={filters}
            pageSize={pageSize}
            workspaceId={workspaceId}
        />
    );

    const hasAccountWithoutTab = accountTabs.some(
        (account) => account.length === 0,
    );

    const hasTabs =
        tabs.length > 1 || (tabs.length === 1 && hasAccountWithoutTab);

    if (isDaosPending || !hasTabs) {
        return renderList();
    }

    const groupTab: IWorkspaceMemberListTab = {
        ...pluginGroupFilter,
        label: t('app.workspace.workspaceMemberList.groupTab'),
    };

    return (
        <PluginFilterComponent<IDaoPlugin, IWorkspaceMemberListTabProps>
            plugins={[groupTab, ...tabs]}
            renderContent={(plugin) => renderList(plugin.props.filters)}
            searchParamName={daoMemberListFilterParam}
        />
    );
};
