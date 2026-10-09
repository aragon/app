'use client';

import { useSearchParams } from 'next/navigation';
import { daoProposalListFilterParam } from '@/modules/governance/components/daoProposalList';
import type { IDao, IDaoPlugin } from '@/shared/api/daoService';
import type { IFilterComponentPlugin } from '@/shared/components/pluginFilterComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
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
     * One tab per visible process of every account, grouped by account in the order of the accounts. The group tab
     * of the list is not one of them, as it stands for no process.
     */
    pluginTabs: IWorkspaceProposalTab[];
    /**
     * Whether the tab strip is worth rendering: more than one process to choose from, and the DAOs resolved.
     */
    hasTabs: boolean;
    /**
     * Process the aside describes: the tab the URL names, or the only process in view when there is no strip to
     * choose from. Undefined while the group tab is active, while the DAOs load, and when no process is in view.
     */
    activeTab?: IWorkspaceProposalTab;
    /**
     * Resolved DAOs, keyed by account ID.
     */
    daos: Record<string, IDao>;
    /**
     * Whether the tabs are still being resolved, i.e. either the DAOs or the CMS visibility overrides. This is what
     * the strip waits for, since a tab offered before the overrides land may be one the CMS hides.
     */
    isPending: boolean;
    /**
     * Whether any of the DAOs is still being read, ignoring the visibility overrides. This is what the rows wait
     * for: they need a DAO rather than the tab list itself.
     */
    isDaosPending: boolean;
}

/**
 * Process tabs of the workspace proposals page, and the one the URL names.
 *
 * Shared by the list, which renders the tabs, and by the page, which hands the selected one to the aside card: both
 * resolve the selection here rather than each from the URL, so they cannot disagree about what a tab is. It reads
 * the parameter without writing it — the `PluginFilterComponent` of the list owns it, and a second writer would
 * fight it.
 * @param params - Accounts whose processes become tabs.
 * @returns The tabs, whether the strip is rendered, the selected tab and the DAOs behind them.
 */
export const useWorkspaceProposalTabs = (
    params: IUseWorkspaceProposalTabsParams,
): IUseWorkspaceProposalTabsResult => {
    const { accounts } = params;

    const { t } = useTranslations();
    const searchParams = useSearchParams();

    const { daos, isPending, isDaosPending, plugins } = useWorkspacePlugins({
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

        // No strip to choose from, so the unfiltered list already shows only this one process: it is what the page
        // is about, and the aside describes it. The DAO proposals page does exactly the same — below two plugins it
        // drops its own group tab, leaving the single process selected — and undefined here when no process is in
        // view at all, which is a workspace with nothing to describe.
        return pluginTabs[0];
    };

    const activeTab = resolveActiveTab();

    return { pluginTabs, hasTabs, activeTab, daos, isPending, isDaosPending };
};
