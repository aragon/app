import type {
    IRequestBodyParams,
    IRequestUrlBodyParams,
    IRequestUrlParams,
} from '@/shared/api/httpService';
import type { IWorkspace } from './domain';

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
 * Body of the update-workspace request. The ID is the one of the updated workspace and the owner is not editable, so
 * neither is part of the request.
 */
export interface IUpdateWorkspaceBody
    extends Omit<IWorkspace, 'id' | 'owner'> {}

export interface IUpdateWorkspaceParams
    extends IRequestUrlBodyParams<
        IGetWorkspaceUrlParams,
        IUpdateWorkspaceBody
    > {}
