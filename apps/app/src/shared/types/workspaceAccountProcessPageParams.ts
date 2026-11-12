import type { IWorkspaceAccountPageParams } from './workspaceAccountPageParams';

export interface IWorkspaceAccountProcessPageParams
    extends IWorkspaceAccountPageParams {
    /**
     * Slug of the process.
     */
    slug: string;
}
