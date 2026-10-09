'use client';

import { useSearchParams } from 'next/navigation';
import { daoMemberListFilterParam } from '@/modules/governance/components/daoMemberList';
import type { IDaoPlugin } from '@/shared/api/daoService';
import type { IFilterComponentPlugin } from '@/shared/components/pluginFilterComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { PluginType } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { pluginSortUtils } from '@/shared/utils/pluginSortUtils';
import type { IWorkspaceMemberListFilters } from '../../api/workspaceQueryService';
import type { IWorkspaceAccount } from '../../api/workspaceService';
import {
    type IWorkspaceDaoPlugins,
    useWorkspacePlugins,
} from '../useWorkspacePlugins';

export interface IWorkspaceMemberTabProps {
    /**
     * Filters narrowing the members to the body of the tab.
     */
    filters?: IWorkspaceMemberListFilters;
}

export interface IWorkspaceMemberTab
    extends IFilterComponentPlugin<IDaoPlugin, IWorkspaceMemberTabProps> {
    /**
     * ID of the account the body is installed on, which doubles as the ID of its DAO. Always set, as every tab this
     * hook returns is one body of one account — the group tab of the list is not one of them.
     */
    accountId: string;
}

export interface IUseWorkspaceMemberTabsParams {
    /**
     * Accounts whose bodies become tabs. A Safe has no body and contributes none, though its owners still reach the
     * list under the group tab.
     */
    accounts: IWorkspaceAccount[];
}

export interface IUseWorkspaceMemberTabsResult {
    /**
     * One tab per visible body of every account, grouped by account in the order of the accounts. The group tab of
     * the list is not one of them, as it stands for no body.
     */
    pluginTabs: IWorkspaceMemberTab[];
    /**
     * Whether the tab strip is worth rendering: more than one body to choose from — or one body and an account
     * contributing members without a tab, so that the group tab shows more than the lone body tab does — and the
     * plugins resolved.
     */
    hasTabs: boolean;
    /**
     * Body the aside describes: the tab the URL names, or the only body in view when there is no strip to choose
     * from. Undefined while the group tab is active, while the plugins load, and when no body is in view.
     */
    activeTab?: IWorkspaceMemberTab;
    /**
     * Visible bodies grouped by DAO, in the order of the accounts, which the rows need alongside the tabs. DAOs
     * that could not be read are left out, as are Safes.
     */
    bodyPlugins: IWorkspaceDaoPlugins[];
    /**
     * Whether the bodies are still being resolved, i.e. either the DAOs or the CMS visibility overrides.
     */
    isPending: boolean;
}

/**
 * Body tabs of the workspace members page, and the one the URL names.
 *
 * Shared by the list, which renders the tabs, and by the page, which hands the selected one to the aside card, so
 * the card beside the list describes whatever the list is filtered to. The counterpart of
 * `useWorkspaceProposalTabs`, and it follows the same rules: it reads the parameter without writing it — the
 * `PluginFilterComponent` of the list owns it — and it derives the selection from the URL alone rather than keeping
 * a copy in state, so no two readers can name different tabs.
 *
 * Sub-plugins are included, as `DaoMemberListContainer` does: the bodies nested in a process hold members of their
 * own, and they sit on a selected account, so the endpoint returns them.
 * @param params - Accounts whose bodies become tabs.
 * @returns The tabs, whether the strip is rendered, the selected tab and the bodies behind them.
 */
export const useWorkspaceMemberTabs = (
    params: IUseWorkspaceMemberTabsParams,
): IUseWorkspaceMemberTabsResult => {
    const { accounts } = params;

    const { t } = useTranslations();
    const searchParams = useSearchParams();

    const { isPending, plugins: bodyPlugins } = useWorkspacePlugins({
        accounts,
        type: PluginType.BODY,
        includeSubPlugins: true,
    });

    // An account contributing no tab — a Safe, an unreadable DAO, or one whose bodies are all hidden — still has
    // members in the list, so the group tab shows more than a lone body tab does and the tabs earn their place.
    const accountsWithTabs = bodyPlugins.filter(
        (daoPlugins) => daoPlugins.plugins.length > 0,
    ).length;
    const hasAccountWithoutTab = accounts.length > accountsWithTabs;

    const isSingleTabbedAccount = accountsWithTabs === 1;

    /**
     * Tabs of a DAO account: one per visible body, in display order. Empty for a DAO whose bodies are all hidden.
     */
    const buildDaoTabs = (
        daoPlugins: IWorkspaceDaoPlugins,
    ): IWorkspaceMemberTab[] => {
        const { accountId, dao } = daoPlugins;

        const tabs: IWorkspaceMemberTab[] = daoPlugins.plugins.map(
            (plugin) => ({
                accountId,
                id: plugin.interfaceType,
                // The network is part of the ID, as the same address is a different plugin on another chain.
                uniqueId: `${dao.network}-${plugin.address}-${plugin.slug}`,
                label: isSingleTabbedAccount
                    ? daoUtils.getPluginName(plugin)
                    : t('app.workspace.workspaceMemberList.pluginTab', {
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
    const pluginTabs = bodyPlugins.flatMap(buildDaoTabs);

    const hasTabs =
        !isPending &&
        (pluginTabs.length > 1 ||
            (pluginTabs.length === 1 && hasAccountWithoutTab));

    // Read straight off the router, as `useWorkspaceProposalTabs` does and for the same reason. A parameter naming
    // the group tab, an unknown body or nothing at all resolves to no tab, which is what the group tab stands for.
    const requestedTab = searchParams.get(daoMemberListFilterParam);

    const resolveActiveTab = (): IWorkspaceMemberTab | undefined => {
        if (isPending) {
            return undefined;
        }

        if (hasTabs) {
            return pluginTabs.find((tab) => tab.uniqueId === requestedTab);
        }

        // No strip to choose from, so the list shows only this one body: it is what the page is about, and the
        // aside describes it, as the DAO members page does for a DAO with a single body. Reached only when no
        // other account contributes members either — that is what would have earned the lone body a strip.
        return pluginTabs[0];
    };

    const activeTab = resolveActiveTab();

    return { pluginTabs, hasTabs, activeTab, bodyPlugins, isPending };
};
