import type { IWorkspaceBase } from './workspaceBase';
import type { IWorkspaceCounts } from './workspaceCounts';
import type { IWorkspaceTarget } from './workspaceTarget';

export interface IWorkspaceDetails extends IWorkspaceBase {
    /**
     * Error that made the scan fail, null when the workspace has no error.
     */
    error: string | null;
    /**
     * Aggregated counts of the entities resolved for the workspace.
     */
    counts: IWorkspaceCounts;
    /**
     * Contracts tracked by the workspace, with their resolved permission gates.
     */
    targets: IWorkspaceTarget[];
}
