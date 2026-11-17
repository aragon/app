import type {
    IRequestBodyParams,
    IRequestUrlBodyParams,
    IRequestUrlParams,
} from '@/shared/api/httpService';
import type { IWorkspace, IWorkspaceAccount } from './domain';

export interface IGetWorkspaceUrlParams {
    /**
     * ID of the workspace to be fetched.
     */
    id: string;
}

export interface IGetWorkspaceParams
    extends IRequestUrlParams<IGetWorkspaceUrlParams> {}

/**
 * Body of the create-workspace request. The ID is assigned by the registry, so it is not part of the request.
 */
export interface ICreateWorkspaceBody extends Omit<IWorkspace, 'id'> {}

export interface ICreateWorkspaceParams
    extends IRequestBodyParams<ICreateWorkspaceBody> {}

/**
 * Body of the add-workspace-account request.
 */
export interface IAddWorkspaceAccountBody {
    /**
     * Account to append to the workspace.
     */
    account: IWorkspaceAccount;
}

export interface IAddWorkspaceAccountParams
    extends IRequestUrlBodyParams<
        IGetWorkspaceUrlParams,
        IAddWorkspaceAccountBody
    > {}

/**
 * Body of the update-workspace-details request: the fields the workspace admin page edits.
 */
export interface IUpdateWorkspaceDetailsBody
    extends Pick<IWorkspace, 'name' | 'description' | 'avatar' | 'links'> {}

export interface IUpdateWorkspaceDetailsParams
    extends IRequestUrlBodyParams<
        IGetWorkspaceUrlParams,
        IUpdateWorkspaceDetailsBody
    > {}

/**
 * Body of the remove-workspace-account request.
 */
export interface IRemoveWorkspaceAccountBody {
    /**
     * ID of the account to remove from the workspace.
     */
    accountId: string;
}

export interface IRemoveWorkspaceAccountParams
    extends IRequestUrlBodyParams<
        IGetWorkspaceUrlParams,
        IRemoveWorkspaceAccountBody
    > {}

/**
 * A single workspace as exported to a file, without its ID so an import is assigned a new one.
 */
export interface IWorkspaceExport {
    /**
     * Version of the export format.
     */
    version: 1;
    /**
     * The exported workspace.
     */
    workspace: Omit<IWorkspace, 'id'>;
}
