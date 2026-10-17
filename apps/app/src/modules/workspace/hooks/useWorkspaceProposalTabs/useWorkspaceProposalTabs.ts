'use client';

import { useSearchParams } from 'next/navigation';
import { daoProposalListFilterParam } from '@/modules/governance/components/daoProposalList';
import type { IDaoPlugin } from '@/shared/api/daoService';
import type { IFilterComponentPlugin } from '@/shared/components/pluginFilterComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { pluginGroupFilter } from '@/shared/hooks/useDaoPlugins';
import { PluginType } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { pluginSortUtils } from '@/shared/utils/pluginSortUtils';
import type { IWorkspaceProposalListFilters } from '../../api/workspaceQueryService';
import type { IWorkspaceAccount } from '../../api/workspaceService';
import { useWorkspacePlugins } from '../useWorkspacePlugins';

export interface IWorkspaceProposalTabProps {
    /**
     * Filters narrowing the proposals to the process of the tab.
     */
    filters?: IWorkspaceProposalListFilters;
}

export interface IWorkspaceProposalTab
    extends IFilterComponentPlugin<IDaoPlugin, IWorkspaceProposalTabProps> {
    /**
     * ID of the account the process is installed on, which doubles as the ID of its DAO. Always set, as every tab
     * this hook returns is one process of one account — the group tab of the list is not one of them.
     */
    accountId: string;
}

export interface IUseWorkspaceProposalTabsParams {
    /**
     * Accounts whose processes become tabs. Non-DAO accounts have no process and are ignored.
     */
    accounts: IWorkspaceAccount[];
}

export interface IUseWorkspaceProposalTabsResult {
    /**
     * Entries of the tab strip: the group tab first, then one tab per visible process of every account, grouped
     * by account in the order of the accounts. Built whether or not the strip renders —
     * {@link IUseWorkspaceProposalTabsResult.hasTabs} decides that.
     *
     * Only the process entries are {@link IWorkspaceProposalTab}s. The group tab stands for no process, so it
     * names no account and can never be the {@link IUseWorkspaceProposalTabsResult.activeTab}.
     */
    filterTabs: IFilterComponentPlugin<
        IDaoPlugin,
        IWorkspaceProposalTabProps
    >[];
    /**
     * Whether the tab strip is worth rendering: more than one process to choose from, and the DAOs resolved.
     */
    hasTabs: boolean;
    /**
     * Process the aside describes: the tab the URL names, or the only process in view when there is no strip to
     * choose from. Undefined while the group tab is active, while the DAOs load, and when no process is in view.
     */
    activeTab?: IWorkspaceProposalTab;
}

/**
 * Tab strip of the workspace proposals page, and the process the URL names.
 *
 * Shared by the list, which renders the tabs, and by the page, which hands the selected one to the aside card: both
 * resolve the selection here rather than each from the URL, so they cannot disagree about what a tab is. It reads
 * the parameter without writing it — the `PluginFilterComponent` of the list owns it, and a second writer would
 * fight it.
 * @param params - Accounts whose processes become tabs.
 * @returns The strip's entries, whether it is rendered and the selected process.
 */
export const useWorkspaceProposalTabs = (
    params: IUseWorkspaceProposalTabsParams,
): IUseWorkspaceProposalTabsResult => {
    const { accounts } = params;

    const { t } = useTranslations();
    const searchParams = useSearchParams();

    const { isPending, plugins } = useWorkspacePlugins({
        accounts,
        type: PluginType.PROCESS,
    });

    // Under an account scope every tab belongs to the same DAO, so naming it on each one only repeats the page.
    const isSingleAccount = accounts.length === 1;

    const pluginTabs = plugins.flatMap(
        ({ accountId, dao, plugins: daoPlugins }) => {
            const tabs: IWorkspaceProposalTab[] = daoPlugins.map((plugin) => ({
                accountId,
                id: plugin.interfaceType,
                // The network is part of the ID, as the same address is a different plugin on another chain.
                uniqueId: `${dao.network}-${plugin.address}-${plugin.slug}`,
                label: isSingleAccount
                    ? daoUtils.getPluginName(plugin)
                    : t('app.workspace.workspaceProposalList.pluginTab', {
                          dao: daoUtils.getDaoDisplayName(dao),
                          plugin: daoUtils.getPluginName(plugin),
                      }),
                meta: plugin,
                props: {
                    filters: {
                        network: dao.network,
                        pluginAddress: plugin.address,
                    },
                },
            }));

            return pluginSortUtils.sortByDisplayOrder(tabs, {
                rootDaoAddress: dao.address,
            });
        },
    );

    // Tabs wait for the DAOs and the overrides, as a tab is only offered once it is known to be visible. With a
    // single process the unfiltered list already shows only its proposals, so there is no selection to make.
    const hasTabs = !isPending && pluginTabs.length > 1;

    // Not an `IWorkspaceProposalTab`: the group tab stands for no process, so it names no account either. It
    // comes first, the strip reading left to right from the widest selection. `pluginGroupFilter` types its own
    // `props` as `object`, hence the override.
    const groupTab: IFilterComponentPlugin<
        IDaoPlugin,
        IWorkspaceProposalTabProps
    > = {
        ...pluginGroupFilter,
        props: {},
        label: t('app.workspace.workspaceProposalList.groupTab'),
    };

    // Read straight off the router rather than through `useFilterUrlParam`, which would keep a copy of the
    // selection in state: every reader of this hook is then a pure function of the URL and the accounts, so two of
    // them cannot come to name different tabs. A parameter naming the group tab, an unknown process or nothing at
    // all resolves to no tab, which is exactly what the group tab stands for.
    const requestedTab = searchParams.get(daoProposalListFilterParam);

    const resolveActiveTab = (): IWorkspaceProposalTab | undefined => {
        if (isPending) {
            return undefined;
        }

        if (hasTabs) {
            return pluginTabs.find((tab) => tab.uniqueId === requestedTab);
        }

        // No strip to choose from. When the single account in view holds the single process, the list *is* that
        // process and the aside describes it — what the DAO proposals page does for a single-process DAO, where
        // `useDaoPlugins` offers no group tab below two plugins. Across several accounts the list still
        // aggregates every one of them unfiltered, so a lone visible process would describe only part of what is
        // on screen.
        return accounts.length === 1 && pluginTabs.length === 1
            ? pluginTabs[0]
            : undefined;
    };

    const activeTab = resolveActiveTab();

    return { filterTabs: [groupTab, ...pluginTabs], hasTabs, activeTab };
};
