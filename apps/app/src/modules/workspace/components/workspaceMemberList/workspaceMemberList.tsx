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
import type { IWorkspaceAccount } from '../../api/workspaceService';
import {
    type IWorkspaceDaoPlugins,
    useWorkspacePlugins,
} from '../../hooks/useWorkspacePlugins';
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

    const { t } = useTranslations();

    // Sub-plugins are included, as `DaoMemberListContainer` does: the bodies nested in a process hold members of
    // their own, and they sit on a selected account, so the endpoint returns them.
    const { isPending, plugins: bodyPlugins } = useWorkspacePlugins({
        accounts,
        type: PluginType.BODY,
        includeSubPlugins: true,
    });

    // The processes the rows need alongside the bodies
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

    /**
     * Tabs of a DAO account: one per visible body, in display order. Empty for a DAO whose bodies are all hidden.
     */
    const buildDaoTabs = (
        daoPlugins: IWorkspaceDaoPlugins,
    ): IWorkspaceMemberListTab[] => {
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

    // Only the DAO accounts that could be read are in `plugins`, in the order of the accounts, so there is nothing
    // to skip here: a Safe is simply absent.
    const tabs = bodyPlugins.flatMap(buildDaoTabs);

    const renderList = (filters?: IWorkspaceMemberListFilters) => (
        <WorkspaceMemberListDefault
            accounts={accounts}
            filters={filters}
            pageSize={pageSize}
            visiblePluginsByAccountId={visiblePluginsByAccountId}
            workspaceId={workspaceId}
        />
    );

    // An account contributing no tab — a Safe, an unreadable DAO, or one whose bodies are all hidden — still has
    // members in the list, so the group tab shows more than a lone body tab does and the tabs earn their place.
    const accountsWithTabs = bodyPlugins.filter(
        (daoPlugins) => daoPlugins.plugins.length > 0,
    ).length;
    const hasAccountWithoutTab = accounts.length > accountsWithTabs;

    const hasTabs =
        tabs.length > 1 || (tabs.length === 1 && hasAccountWithoutTab);

    if (isPending || !hasTabs) {
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
