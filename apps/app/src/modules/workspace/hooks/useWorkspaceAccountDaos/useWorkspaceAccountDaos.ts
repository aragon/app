'use client';

import { useQueries } from '@tanstack/react-query';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '@/modules/workspace/api/workspaceService';
import { daoOptions, type IDao } from '@/shared/api/daoService';

export interface IUseWorkspaceAccountDaosParams {
    /**
     * Accounts of the workspace to resolve the DAO data for.
     */
    accounts?: IWorkspaceAccount[];
}

export interface IWorkspaceAccountDao {
    /**
     * Workspace account the DAO was resolved for.
     */
    account: IWorkspaceAccount;
    /**
     * DAO data of the account, undefined while the DAO query is loading or when it failed.
     */
    dao?: IDao;
}

export interface IUseWorkspaceAccountDaosReturn {
    /**
     * DAO accounts of the workspace paired with their resolved DAO data, in workspace order.
     */
    accountDaos: IWorkspaceAccountDao[];
    /**
     * Defines if any of the DAO queries is still loading.
     */
    isLoading: boolean;
}

/**
 * Resolves the DAO data of every DAO-type account of a workspace.
 *
 * Each account is fetched with the same `daoOptions` query used by the DAO pages, so the DAO data (including its
 * `linkedAccounts`) is shared with any other consumer through the React Query cache.
 */
export const useWorkspaceAccountDaos = (
    params: IUseWorkspaceAccountDaosParams,
): IUseWorkspaceAccountDaosReturn => {
    const { accounts } = params;

    const daoAccounts = (accounts ?? []).filter(
        (account) => account.type === WorkspaceAccountType.DAO,
    );

    return useQueries({
        queries: daoAccounts.map((account) =>
            daoOptions({ urlParams: { id: account.id } }),
        ),
        combine: (results) => ({
            accountDaos: daoAccounts.map((account, index) => ({
                account,
                dao: results[index]?.data,
            })),
            isLoading: results.some((result) => result.isLoading),
        }),
    });
};
