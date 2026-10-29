'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { daoMemberListFilterParam } from '@/modules/governance/components/daoMemberList';
import { type IDaoPlugin, PluginInterfaceType } from '@/shared/api/daoService';
import type { IFilterComponentPlugin } from '@/shared/components/pluginFilterComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { pluginGroupFilter } from '@/shared/hooks/useDaoPlugins';
import { PluginType } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { pluginSortUtils } from '@/shared/utils/pluginSortUtils';
import {
    type IWorkspaceMemberListFilters,
    useWorkspaceAccounts,
} from '../../api/workspaceQueryService';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import { workspaceUtils } from '../../utils/workspaceUtils';
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

/**
 * What a tab of the strip stands for: a body of a DAO account, or a Safe account as a whole.
 */
export type IWorkspaceMemberTabMeta = IDaoPlugin | IWorkspaceAccount;

interface IWorkspaceMemberTabBase
    extends IFilterComponentPlugin<
        IWorkspaceMemberTabMeta,
        IWorkspaceMemberTabProps
    > {
    /**
     * ID of the account the tab belongs to — the account the body is installed on, which doubles as the ID of its
     * DAO, or the Safe account itself. Always set, as every tab this hook returns is one body of one account or one
     * Safe account — the group tab of the list is not one of them.
     */
    accountId: string;
}

export interface IWorkspaceBodyMemberTab extends IWorkspaceMemberTabBase {
    /**
     * Discriminates a body tab from a Safe account tab.
     */
    kind: 'body';
    /**
     * Body the tab narrows the list to.
     */
    meta: IDaoPlugin;
}

export interface IWorkspaceSafeMemberTab extends IWorkspaceMemberTabBase {
    /**
     * Discriminates a Safe account tab from a body tab.
     */
    kind: 'safe';
    /**
     * Safe account the tab narrows the list to.
     */
    meta: IWorkspaceAccount;
}

/**
 * Tab of the strip naming one body of a DAO account, or one Safe account. A Safe that is only a DAO body is a body
 * tab; a Safe that is also a workspace account in view has a Safe tab besides.
 */
export type IWorkspaceMemberTab =
    | IWorkspaceBodyMemberTab
    | IWorkspaceSafeMemberTab;

export interface IUseWorkspaceMemberTabsParams {
    /**
     * Accounts whose bodies become tabs. A Safe account becomes one tab of its own, narrowing the list to its
     * owners.
     */
    accounts: IWorkspaceAccount[];
}

export interface IUseWorkspaceMemberTabsResult {
    /**
     * Entries of the tab strip: the group tab first, then one tab per visible body of every DAO account and one
     * per Safe account, grouped by account in the order of the accounts. Built whether or not the strip renders —
     * {@link IUseWorkspaceMemberTabsResult.hasTabs} decides that.
     *
     * Only the body and Safe entries are {@link IWorkspaceMemberTab}s. The group tab stands for no body, so it
     * names no account and can never be the {@link IUseWorkspaceMemberTabsResult.activeTab}.
     */
    filterTabs: IFilterComponentPlugin<
        IWorkspaceMemberTabMeta,
        IWorkspaceMemberTabProps
    >[];
    /**
     * Whether the tab strip is worth rendering: more than one tab to choose from — or one tab and an account
     * contributing members without a tab, so that the group tab shows more than the lone body tab does — and the
     * plugins resolved.
     */
    hasTabs: boolean;
    /**
     * Body or Safe account the aside describes, and the one the list is narrowed to: the tab the URL names, or the
     * only tab in view when there is no strip to choose from. Undefined while the group tab is active, while the
     * plugins load, and when no tab is in view.
     */
    activeTab?: IWorkspaceMemberTab;
}

/**
 * Body and Safe account tabs of the workspace members page, and the one the URL names.
 *
 * Shared by the list, which renders the tabs, and by the page, which hands the selected one to the aside card, so
 * the card beside the list describes whatever the list is filtered to. The counterpart of
 * `useWorkspaceProposalTabs`, and it follows the same rules: it reads the parameter without writing it — the
 * `PluginFilterComponent` of the list owns it — and it derives the selection from the URL alone rather than keeping
 * a copy in state, so no two readers can name different tabs.
 *
 * The bodies themselves are not returned: a caller needing them reads `useWorkspacePlugins` for itself, as the
 * list does for its rows, with the same parameters as below so that the rows and the strip agree on which bodies
 * are visible. The read is shared, so it costs no request.
 * @param params - Accounts whose bodies, or which as Safes, become tabs.
 * @returns The strip's entries, whether it is rendered and the selected tab.
 */
export const useWorkspaceMemberTabs = (
    params: IUseWorkspaceMemberTabsParams,
): IUseWorkspaceMemberTabsResult => {
    const { accounts } = params;

    const { t } = useTranslations();
    const searchParams = useSearchParams();

    // Sub-plugins included, as `DaoMemberListContainer` does: a body nested in a process holds members of its own,
    // and it sits on a selected account, so the endpoint returns it. The rows read the bodies the same way.
    const { isPending, plugins: bodyPlugins } = useWorkspacePlugins({
        accounts,
        type: PluginType.BODY,
        includeSubPlugins: true,
    });

    const safeAccounts = accounts.filter(
        (account) => account.type === WorkspaceAccountType.SAFE,
    );

    // Labelled exactly as `useWorkspaceAccountOptions` labels the selector's options, so a Safe's tab and its option
    // never disagree. On the aggregated page the refs are the selector's own, so the read is shared with it.
    const accountRefs = useMemo(
        () => accounts.map(({ network, address }) => ({ network, address })),
        [accounts],
    );
    const { data: accountInfos } = useWorkspaceAccounts(
        { body: { accounts: accountRefs } },
        { enabled: safeAccounts.length > 0 },
    );

    // An account contributing no tab — an unreadable DAO, or one whose bodies are all hidden — still has members in
    // the list, so the group tab shows more than a lone tab does and the tabs earn their place. A Safe account
    // always has a tab of its own.
    const accountsWithTabs =
        bodyPlugins.filter((daoPlugins) => daoPlugins.plugins.length > 0)
            .length + safeAccounts.length;
    const hasAccountWithoutTab = accounts.length > accountsWithTabs;

    const isSingleTabbedAccount = accountsWithTabs === 1;

    /**
     * Tabs of a DAO account: one per visible body, in display order. Empty for a DAO whose bodies are all hidden.
     */
    const buildDaoTabs = (
        daoPlugins: IWorkspaceDaoPlugins,
    ): IWorkspaceBodyMemberTab[] => {
        const { accountId, dao } = daoPlugins;

        const tabs: IWorkspaceBodyMemberTab[] = daoPlugins.plugins.map(
            (plugin) => ({
                kind: 'body',
                accountId,
                id: plugin.interfaceType,
                // The DAO pages' own ID, prefixed with the network: the strip spans several networks, and the same
                // address is a different plugin on another chain.
                uniqueId: `${dao.network}-${daoUtils.getPluginTabId(plugin, dao.address)}`,
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

    /**
     * Tab of a Safe account, narrowing the list to its owners. Keyed as a Safe body is, minus the DAO it has none
     * of, so it never collides with the body tab of the same Safe held by a DAO in view.
     */
    const buildSafeTab = (
        account: IWorkspaceAccount,
    ): IWorkspaceSafeMemberTab => ({
        kind: 'safe',
        accountId: account.id,
        id: PluginInterfaceType.SAFE,
        uniqueId: `${account.network}-${daoUtils.getPluginTabId({
            address: account.address,
            slug: 'safe',
            interfaceType: PluginInterfaceType.SAFE,
        })}`,
        label: workspaceUtils.getAccountLabel(
            account,
            workspaceUtils.findAccountInfo(accountInfos, account),
        ),
        meta: account,
        props: {
            filters: {
                network: account.network,
                governanceAddress: account.address,
            },
        },
    });

    // Only the DAO accounts that could be read are in `plugins`, so a DAO missing from it contributes no tab.
    const daoPluginsByAccountId = new Map(
        bodyPlugins.map((daoPlugins) => [daoPlugins.accountId, daoPlugins]),
    );

    const pluginTabs: IWorkspaceMemberTab[] = accounts.flatMap(
        (account): IWorkspaceMemberTab[] => {
            if (account.type === WorkspaceAccountType.SAFE) {
                return [buildSafeTab(account)];
            }

            const daoPlugins = daoPluginsByAccountId.get(account.id);

            return daoPlugins != null ? buildDaoTabs(daoPlugins) : [];
        },
    );

    const hasTabs =
        !isPending &&
        (pluginTabs.length > 1 ||
            (pluginTabs.length === 1 && hasAccountWithoutTab));

    // Not an `IWorkspaceMemberTab`: the group tab stands for no body, so it names no account either. It comes
    // first, the strip reading left to right from the widest selection. `pluginGroupFilter` types its own `props`
    // as `object`, hence the override.
    const groupTab: IFilterComponentPlugin<
        IWorkspaceMemberTabMeta,
        IWorkspaceMemberTabProps
    > = {
        ...pluginGroupFilter,
        props: {},
        label: t('app.workspace.workspaceMemberList.groupTab'),
    };

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

        // No strip to choose from, so the list is narrowed to this one tab
        return pluginTabs[0];
    };

    const activeTab = resolveActiveTab();

    return { filterTabs: [groupTab, ...pluginTabs], hasTabs, activeTab };
};
