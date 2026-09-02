import type { IResource } from '@/shared/api/daoService';
import type { IWorkspaceAccount } from './workspaceAccount';

export interface IWorkspace {
    /**
     * Identifier of the workspace, used as the `workspaceId` URL parameter.
     */
    id: string;
    /**
     * Name of the workspace.
     */
    name: string;
    /**
     * Description of the workspace.
     */
    description: string;
    /**
     * Avatar of the workspace or null when the workspace has no avatar.
     */
    avatar: string | null;
    /**
     * Links of the workspace.
     */
    links: IResource[];
    /**
     * Accounts belonging to the workspace. Ordered as they should be displayed on the account filters.
     */
    accounts: IWorkspaceAccount[];
}
