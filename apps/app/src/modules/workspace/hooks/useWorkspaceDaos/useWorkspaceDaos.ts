'use client';

import { useQueries } from '@tanstack/react-query';
import { daoOptions, type IDao } from '@/shared/api/daoService';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';

export interface IUseWorkspaceDaosReturn {
    /**
     * Resolved DAOs, keyed by account ID.
     */
    daos: Record<string, IDao>;
    /**
     * Whether any of the DAOs is still being read.
     */
    isPending: boolean;
}

/**
 * Reads the full DAO of every DAO account of a workspace.
 *
 * The aggregated endpoints embed only the display metadata of a DAO (name, avatar, links) and no plugins, so they
 * cannot resolve a proposal slug or URL. Those need the real DAO, which is what this reads. The queries are shared
 * with the rest of the app, therefore they are usually already cached by the time a workspace page mounts.
 * @param accounts - Accounts of the workspace. Non-DAO accounts are ignored.
 * @returns The DAOs keyed by account ID and whether any read is still pending.
 */
export const useWorkspaceDaos = (
    accounts: IWorkspaceAccount[] = [],
): IUseWorkspaceDaosReturn => {
    const ids = accounts
        .filter((account) => account.type === WorkspaceAccountType.DAO)
        .map((account) => account.id);

    const queries = ids.map((id) => daoOptions({ urlParams: { id } }));

    return useQueries({
        queries,
        combine: (results) => {
            const daos: Record<string, IDao> = {};

            results.forEach((result, index) => {
                const id = ids[index];

                if (result.data != null && id != null) {
                    const dao = result.data;
                    const workspaceAccount = accounts.find(
                        (account) => account.id === dao.id,
                    );
                    const workspaceAccountMetadata = workspaceAccount?.metadata;

                    dao.avatar = workspaceAccountMetadata?.avatar ?? dao.avatar;
                    dao.name = workspaceAccountMetadata?.name ?? dao.name;
                    dao.description =
                        workspaceAccountMetadata?.description ??
                        dao.description;

                    daos[id] = dao;
                }
            });

            return {
                daos,
                isPending: results.some((result) => result.isPending),
            };
        },
    });
};
