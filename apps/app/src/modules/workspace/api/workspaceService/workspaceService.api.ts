import type {
    IRequestBodyParams,
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
