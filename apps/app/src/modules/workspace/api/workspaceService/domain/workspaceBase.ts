import type { Network } from '@/shared/api/daoService';
import type { WorkspaceStatus } from './enum';

/**
 * Fields shared by every workspace representation, and the complete body returned by the create
 * endpoint: the scan runs in the background, so nothing is known about the targets yet.
 */
export interface IWorkspaceBase {
    /**
     * ID of the workspace.
     */
    id: string;
    /**
     * Name of the workspace, unique per creator.
     */
    name: string;
    /**
     * Display title of the workspace, null when it only has a name.
     */
    title: string | null;
    /**
     * Description of the workspace, null when it has none.
     */
    description: string | null;
    /**
     * Logo of the workspace, null when it has none.
     */
    logo: string | null;
    /**
     * Address of the user that created the workspace.
     */
    creator: string;
    /**
     * Network of the workspace.
     */
    network: Network;
    /**
     * Status of the workspace scan.
     */
    status: WorkspaceStatus;
}
