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
}

export interface IWorkspaceDaoPlugins {
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
     * Whether any of the DAOs is still being read.
     */
    isPending: boolean;
    /**
     * Plugins grouped by DAO, in the order of the accounts. DAOs that could not be read are left out.
     */
    plugins: IWorkspaceDaoPlugins[];
}

/**
 * Reads the visible plugins of the given type of every DAO account of a workspace.
 *
 * Sub-plugins and linked-account plugins are left out, as the workspace query endpoints only return the data of
 * the selected accounts.
 * @param params - Accounts of the workspace and type of the plugins to return.
 * @returns The DAOs, whether any is still being read and their plugins grouped by DAO.
 */
export const useWorkspacePlugins = (
    params: IUseWorkspacePluginsParams,
): IUseWorkspacePluginsReturn => {
    const { accounts, type } = params;

    const { daos, isPending } = useWorkspaceDaos(accounts);
    const { data: daoOverrides } = useDaoOverrides();

    const plugins = accounts.flatMap((account) => {
        const dao = daos[account.id];

        if (dao == null) {
            return [];
        }

        const daoPlugins = daoUtils.getDaoPlugins(dao, {
            type,
            includeSubPlugins: false,
            includeLinkedAccounts: false,
        });
        const visiblePlugins = daoVisibilityUtils.filterHiddenPlugins(
            daoPlugins,
            daoOverrides?.[dao.id],
        );

        return [{ dao, plugins: visiblePlugins }];
    });

    return { daos, isPending, plugins };
};
