import type { IWorkspacePageParams } from './workspacePageParams';

export interface IWorkspaceAccountPageParams extends IWorkspacePageParams {
    /**
     * ID of the workspace account the page is scoped to, in the `{network}-{address}` format, or
     * `workspaceAllAccountsSegment` when the page aggregates every account of the workspace.
     *
     * For a DAO account it doubles as the DAO ID, which is what lets the server resolve the account without reading
     * the workspace registry — the registry lives on local storage and cannot be read during a server render.
     */
    accountId: string;
}
