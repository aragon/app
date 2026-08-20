import type { IWorkspaceBase } from './workspaceBase';

/**
 * One row of the workspace list, without the per-target detail.
 */
export interface IWorkspace extends IWorkspaceBase {
    /**
     * Number of contracts tracked by the workspace.
     */
    targets: number;
    /**
     * ISO date the workspace was created at.
     */
    createdAt: string;
}
