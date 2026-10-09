'use client';

import { daoProposalListFilterParam } from '@/modules/governance/components/daoProposalList';
import type { IDaoPlugin } from '@/shared/api/daoService';
import {
    type IFilterComponentPlugin,
    PluginFilterComponent,
} from '@/shared/components/pluginFilterComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { pluginGroupFilter } from '@/shared/hooks/useDaoPlugins';
import type { IWorkspaceProposalListFilters } from '../../api/workspaceQueryService';
import type { IWorkspaceAccount } from '../../api/workspaceService';
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
}

/**
 * Aggregated proposal list of a workspace, filtered by tabs like `DaoProposalList` of the DAO pages: one "all" tab
 * followed by one tab for every visible process plugin of every DAO, grouped by DAO in the order of the accounts.
 *
 * The tabs come from `useWorkspaceProposalTabs`, which the page reads too in order to hand the selected one to the
 * aside card, so the card beside the list describes whatever the list is filtered to. This component owns the URL
 * parameter through its `PluginFilterComponent`; every other reader of the hook only reads it.
 *
 * Linked-account plugins are left out, as the endpoint only returns the proposals of the selected accounts.
 */
export const WorkspaceProposalList: React.FC<IWorkspaceProposalListProps> = (
    props,
) => {
    const { accounts, pageSize, isAccountScoped } = props;

    const { t } = useTranslations();

    const { pluginTabs, hasTabs, daos, isDaosPending } =
        useWorkspaceProposalTabs({ accounts });

    const renderList = (filters?: IWorkspaceProposalListFilters) => (
        <WorkspaceProposalListDefault
            accounts={accounts}
            daos={daos}
            filters={filters}
            isAccountScoped={isAccountScoped}
            isDaosPending={isDaosPending}
            pageSize={pageSize}
        />
    );

    if (!hasTabs) {
        return renderList();
    }

    // Not an `IWorkspaceProposalTab`: the group tab stands for no process, so it names no account either.
    const groupTab: IFilterComponentPlugin<
        IDaoPlugin,
        IWorkspaceProposalTabProps
    > = {
        ...pluginGroupFilter,
        props: {},
        label: t('app.workspace.workspaceProposalList.groupTab'),
    };

    return (
        <PluginFilterComponent<IDaoPlugin, IWorkspaceProposalTabProps>
            plugins={[groupTab, ...pluginTabs]}
            renderContent={(plugin) => renderList(plugin.props.filters)}
            searchParamName={daoProposalListFilterParam}
        />
    );
};
