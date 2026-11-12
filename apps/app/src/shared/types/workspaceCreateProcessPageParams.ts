import type { IWorkspaceAccountPageParams } from './workspaceAccountPageParams';

export interface IWorkspaceCreateProcessPageParams
    extends IWorkspaceAccountPageParams {
    /**
     * Address of the plugin the process is created through.
     */
    pluginAddress: string;
}
