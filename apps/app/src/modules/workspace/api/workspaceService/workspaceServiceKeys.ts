import type {
    IGetWorkspaceParams,
    IGetWorkspacesParams,
} from './workspaceService.api';

export enum WorkspaceServiceKey {
    WORKSPACES = 'WORKSPACES',
    WORKSPACE = 'WORKSPACE',
}

export const workspaceServiceKeys = {
    workspaces: (params: IGetWorkspacesParams) => [
        WorkspaceServiceKey.WORKSPACES,
        params,
    ],
    workspace: (params: IGetWorkspaceParams) => [
        WorkspaceServiceKey.WORKSPACE,
        params,
    ],
};
