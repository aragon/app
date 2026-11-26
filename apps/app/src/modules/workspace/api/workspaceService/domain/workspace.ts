import type { IResource } from '@/shared/api/daoService';
import type { IWorkspaceAccount } from './workspaceAccount';
import type { IWorkspaceAlias } from './workspaceAlias';
import type { IWorkspaceTarget } from './workspaceTarget';

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
    /**
     * Targets of the workspace. Opaque addresses for now, to be used for account discovery later on.
     */
    targets: IWorkspaceTarget[];
    /**
     * Names of addresses, the address book of the workspace. Missing in workspaces stored before it existed.
     */
    aliases?: IWorkspaceAlias[];
}
