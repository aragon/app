import {
    type IWorkspaceAccountInfo,
    type IWorkspaceAccountRef,
    workspaceQueryService,
} from '../../api/workspaceQueryService';

class WorkspaceAccountInfoUtils {
    /**
     * Resolves what an address is (Safe or DAO) through the workspace accounts API. Backs the Safe branch of the
     * account member pages.
     *
     * Returns `undefined` when the lookup throws, so callers fall back to the DAO path.
     */
    getAccountInfo = async (
        params: IWorkspaceAccountRef,
    ): Promise<IWorkspaceAccountInfo | undefined> => {
        const { network, address } = params;

        try {
            const data = await workspaceQueryService.getAccounts({
                body: { accounts: [{ network, address }] },
            });

            return data[0];
        } catch {
            // Falls back to the DAO path
            return undefined;
        }
    };
}

export const workspaceAccountInfoUtils = new WorkspaceAccountInfoUtils();
