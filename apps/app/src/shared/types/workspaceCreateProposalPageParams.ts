import type { IWorkspaceAccountPageParams } from './workspaceAccountPageParams';

export interface IWorkspaceCreateProposalPageParams
    extends IWorkspaceAccountPageParams {
    /**
     * Address of the plugin to create the proposal for.
     */
    pluginAddress: string;
}
