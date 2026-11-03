import type { WorkspaceCoverageSource, WorkspaceCoverageStatus } from './enum';
import type { IWorkspaceAccountRef } from './workspaceAccountInfo';

export interface IWorkspaceCoverage {
    /**
     * Account the coverage refers to.
     */
    account: IWorkspaceAccountRef;
    /**
     * Resource the coverage refers to, e.g. `assets`.
     */
    resource: string;
    /**
     * Where the data came from.
     */
    source: WorkspaceCoverageSource;
    /**
     * Whether the source could be read.
     */
    status: WorkspaceCoverageStatus;
    /**
     * Set when the data came from the stale cache window. The data is still usable and must be displayed.
     */
    stale?: boolean;
    /**
     * Error reported by the source, set when the status is unavailable.
     */
    error?: { code: string; retryAfter?: number };
    /**
     * Set when the account was not selected itself but reached through this selected DAO's process.
     */
    via?: IWorkspaceAccountRef;
}
