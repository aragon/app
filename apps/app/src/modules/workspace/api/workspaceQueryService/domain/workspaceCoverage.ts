import type {
    WorkspaceCoverageResource,
    WorkspaceCoverageSource,
    WorkspaceCoverageStatus,
} from './enum';
import type {
    IWorkspaceAccountInfoError,
    IWorkspaceAccountRef,
} from './workspaceAccountInfo';

/**
 * Per-account report of whether a source could be read, returned by every workspace query endpoint except accounts.
 *
 * It is what separates "this account has nothing" from "this account could not be read", so it must be consulted
 * before rendering an empty result as if it were complete.
 */
export interface IWorkspaceCoverage {
    /**
     * Account the entry reports on.
     */
    account: IWorkspaceAccountRef;
    /**
     * Resource the entry reports on.
     */
    resource: WorkspaceCoverageResource;
    /**
     * Source the resource was read from.
     */
    source: WorkspaceCoverageSource;
    /**
     * Whether the source could be read.
     */
    status: WorkspaceCoverageStatus;
    /**
     * Set when the data comes from the stale cache window of the Safe service. Such data is still displayed.
     */
    stale?: boolean;
    /**
     * Selected DAO the account was reached through, set for Safes that were not selected themselves.
     */
    via?: IWorkspaceAccountRef;
    /**
     * Error reported by the source, set when the status is unavailable.
     */
    error?: IWorkspaceAccountInfoError;
}
