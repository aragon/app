'use client';

import { useDaoOverrides } from '@/shared/api/cmsService';
import type { IDao, IDaoPlugin } from '@/shared/api/daoService';
import type { PluginType } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { daoVisibilityUtils } from '@/shared/utils/daoVisibilityUtils';
import type { IWorkspaceAccount } from '../../api/workspaceService';
import { useWorkspaceDaos } from '../useWorkspaceDaos';

export interface IUseWorkspacePluginsParams {
    /**
     * Accounts of the workspace. Non-DAO accounts are ignored.
     */
    accounts: IWorkspaceAccount[];
    /**
     * Type of the plugins to return.
     */
    type: PluginType;
    /**
     * Includes the plugins nested inside a process (e.g. the bodies of an SPP stage) when set to true. They belong
     * to the account they are installed on, so the aggregated endpoints do return their data.
     * @default false
     */
    includeSubPlugins?: boolean;
}

export interface IWorkspaceDaoPlugins {
    /**
     * ID of the account the plugins belong to, to pair the entry back with the account it was read for.
     */
    accountId: string;
    /**
     * DAO the plugins are installed on.
     */
    dao: IDao;
    /**
     * Visible plugins of the DAO matching the requested type.
     */
    plugins: IDaoPlugin[];
}

export interface IUseWorkspacePluginsReturn {
    /**
     * Resolved DAOs, keyed by account ID.
     */
    daos: Record<string, IDao>;
    /**
     * Whether the plugins are still being resolved, i.e. any of the DAOs or the visibility overrides is still being
     * read. This is what anything built out of {@link IUseWorkspacePluginsReturn.plugins} must wait for.
     *
     * It covers the overrides and not only the DAOs because the overrides decide which plugins are returned: a
     * caller that renders on the DAOs alone renders plugins that are about to be filtered out. The tabs built on
     * this are validated against the URL parameter at mount only, so a hidden body appearing for a tick is a hidden
     * body that can be selected — and whose members are then fetched and shown.
     */
    isPending: boolean;
    /**
     * Whether any of the DAOs is still being read, ignoring the visibility overrides.
     * For the callers that need a DAO rather than the plugin list itself
     */
    isDaosPending: boolean;
    /**
     * Whether the visibility overrides are still being read, ignoring the DAOs.
     * For the callers that need the plugin list itself rather than a DAO
     */
    isPluginsPending: boolean;
    /**
     * Plugins grouped by DAO, in the order of the accounts. DAOs that could not be read are left out.
     */
    plugins: IWorkspaceDaoPlugins[];
}

/**
 * Reads the visible plugins of the given type of every DAO account of a workspace.
 *
 * Linked-account plugins are always left out, as the workspace query endpoints only return the data of the
 * selected accounts. Sub-plugins are opt-in: they sit on a selected account, so the endpoints cover them.
 * @param params - Accounts of the workspace, type of the plugins to return and whether to include sub-plugins.
 * @returns The DAOs, whether the plugins and the DAOs are still being resolved, and the plugins grouped by DAO.
 */
export const useWorkspacePlugins = (
    params: IUseWorkspacePluginsParams,
): IUseWorkspacePluginsReturn => {
    const { accounts, type, includeSubPlugins = false } = params;

    const { daos, isPending: isDaosPending } = useWorkspaceDaos(accounts);
    const { data: daoOverrides, isPending: isOverridesPending } =
        useDaoOverrides();

    const plugins = accounts.flatMap((account) => {
        const dao = daos[account.id];

        if (dao == null) {
            return [];
        }

        const daoPlugins = daoUtils.getDaoPlugins(dao, {
            type,
            includeSubPlugins,
            includeLinkedAccounts: false,
        });
        const visiblePlugins = daoVisibilityUtils.filterHiddenPlugins(
            daoPlugins,
            daoOverrides?.[dao.id],
        );

        return [{ accountId: account.id, dao, plugins: visiblePlugins }];
    });

    return {
        daos,
        plugins,
        isDaosPending,
        isPluginsPending: isOverridesPending,
        isPending: isDaosPending || isOverridesPending,
    };
};
