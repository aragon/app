import type { WorkspaceScheme, WorkspaceTargetStatus } from './enum';
import type { IWorkspaceGate } from './workspaceGate';

export interface IWorkspaceTarget {
    /**
     * Address of the tracked contract.
     */
    address: string;
    /**
     * Outcome of the scan for this target.
     */
    status: WorkspaceTargetStatus;
    /**
     * Access-control schemes detected on the target.
     */
    schemes: WorkspaceScheme[];
    /**
     * Owner of the target, null when the target has no owner.
     */
    owner: string | null;
    /**
     * Owner the ownership is being transferred to, null when no transfer is pending.
     */
    pendingOwner: string | null;
    /**
     * Authority contract of the target, null when the target has no authority.
     */
    authority: string | null;
    /**
     * Permission gates detected on the target. Empty means nothing gated was found, not that the
     * target was not scanned — check the status for that.
     */
    gates: IWorkspaceGate[];
    /**
     * Error that occurred while scanning the target, null when the target has no error.
     */
    error: string | null;
}
