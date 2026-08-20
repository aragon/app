import type { Network } from '@/shared/api/daoService';
import type {
    IRequestBodyParams,
    IRequestQueryParams,
    IRequestUrlParams,
} from '@/shared/api/httpService';

export interface ICreateWorkspaceBody {
    /**
     * Name of the workspace, must be unique for the creator.
     */
    name: string;
    /**
     * Address of the user creating the workspace.
     */
    creator: string;
    /**
     * Network of the workspace.
     */
    network: Network;
    /**
     * Addresses of the contracts to be tracked by the workspace, at least one and at most
     * `workspaceMaxTargets`.
     */
    targets: string[];
    /**
     * Accounts to get answers about. Each is verified against the gates by direct reads, so they get
     * capability rows even on networks where holder discovery cannot run.
     */
    accounts?: string[];
}

export interface ICreateWorkspaceParams
    extends IRequestBodyParams<ICreateWorkspaceBody> {}

export interface IGetWorkspacesQueryParams {
    /**
     * Address of the user that created the workspaces.
     */
    creator: string;
    /**
     * Only return the workspace with the given name when set. Names are unique per creator.
     */
    name?: string;
}

export interface IGetWorkspacesParams
    extends IRequestQueryParams<IGetWorkspacesQueryParams> {}

export interface IGetWorkspaceUrlParams {
    /**
     * ID of the workspace to fetch.
     */
    workspaceId: string;
}

export interface IGetWorkspaceParams
    extends IRequestUrlParams<IGetWorkspaceUrlParams> {}
