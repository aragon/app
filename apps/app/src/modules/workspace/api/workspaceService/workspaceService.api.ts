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
 * Body of the update-workspace request. The ID is the one of the updated workspace, so it is not part of the request.
 */
export interface IUpdateWorkspaceBody extends Omit<IWorkspace, 'id'> {}

export interface IUpdateWorkspaceParams
    extends IRequestUrlBodyParams<
        IGetWorkspaceUrlParams,
        IUpdateWorkspaceBody
    > {}

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
