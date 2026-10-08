'use client';

import { daoProposalListFilterParam } from '@/modules/governance/components/daoProposalList';
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
import type { IWorkspaceProposalListFilters } from '../../api/workspaceQueryService';
import type { IWorkspaceAccount } from '../../api/workspaceService';
import { useWorkspacePlugins } from '../../hooks/useWorkspacePlugins';
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
}

interface IWorkspaceProposalListTabProps {
    /**
     * Filters narrowing the proposals to the plugin of the tab, unset for the group tab.
     */
    filters?: IWorkspaceProposalListFilters;
}

/**
 * Aggregated proposal list of a workspace, filtered by tabs like `DaoProposalList` of the DAO pages: one "all" tab
 * followed by one tab for every visible process plugin of every DAO, grouped by DAO in the order of the accounts.
 *
 * Linked-account plugins are left out, as the endpoint only returns the proposals of the selected accounts.
 */
export const WorkspaceProposalList: React.FC<IWorkspaceProposalListProps> = (
    props,
) => {
    const { accounts, pageSize } = props;

    const { t } = useTranslations();

    const { daos, isPending, isDaosPending, plugins } = useWorkspacePlugins({
        accounts,
        type: PluginType.PROCESS,
    });

    const pluginTabs = plugins.flatMap(({ dao, plugins: daoPlugins }) => {
        const tabs: IFilterComponentPlugin<
            IDaoPlugin,
            IWorkspaceProposalListTabProps
        >[] = daoPlugins.map((plugin) => ({
            id: plugin.interfaceType,
            // The network is part of the ID, as the same address is a different plugin on another chain.
            uniqueId: `${dao.network}-${plugin.address}-${plugin.slug}`,
            label: t('app.workspace.workspaceProposalList.pluginTab', {
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
    });

    const renderList = (filters?: IWorkspaceProposalListFilters) => (
        <WorkspaceProposalListDefault
            accounts={accounts}
            daos={daos}
            filters={filters}
            isDaosPending={isDaosPending}
            pageSize={pageSize}
        />
    );

    // Tabs wait for the CMS overrides that decide which plugins are visible *and* for every DAO: a tab built while
    // the overrides are pending is a tab for a plugin about to be filtered out, selectable and with its proposals
    // fetched behind it; and a tab set built while a DAO is still loading leaves the URL parameter of one of its
    // plugins invalid, so the group tab shows in its place until that DAO lands. With a single plugin the unfiltered
    // list already shows only its proposals, and shares its request with the aside card.
    if (isPending || pluginTabs.length <= 1) {
        return renderList();
    }

    const groupTab: IFilterComponentPlugin<
        IDaoPlugin,
        IWorkspaceProposalListTabProps
    > = {
        ...pluginGroupFilter,
        label: t('app.workspace.workspaceProposalList.groupTab'),
    };

    return (
        <PluginFilterComponent<IDaoPlugin, IWorkspaceProposalListTabProps>
            plugins={[groupTab, ...pluginTabs]}
            renderContent={(plugin) => renderList(plugin.props.filters)}
            searchParamName={daoProposalListFilterParam}
        />
    );
};
