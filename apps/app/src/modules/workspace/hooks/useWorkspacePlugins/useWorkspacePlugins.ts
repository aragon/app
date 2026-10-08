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
 * Linked-account plugins are always left out, as the workspace query endpoints only return the data of the
 * selected accounts. Sub-plugins are opt-in: they sit on a selected account, so the endpoints cover them.
 * @param params - Accounts of the workspace, type of the plugins to return and whether to include sub-plugins.
 * @returns The DAOs, whether any is still being read and their plugins grouped by DAO.
 */
export const useWorkspacePlugins = (
    params: IUseWorkspacePluginsParams,
): IUseWorkspacePluginsReturn => {
    const { accounts, type, includeSubPlugins = false } = params;

    const { daos, isPending } = useWorkspaceDaos(accounts);
    const { data: daoOverrides } = useDaoOverrides();

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

    return { daos, isPending, plugins };
};
