import type { IWorkspaceAccountPageParams } from './workspaceAccountPageParams';

export interface IWorkspaceAccountMemberPageParams
    extends IWorkspaceAccountPageParams {
    /**
     * Address of the member of the account.
     */
    address: string;
}
