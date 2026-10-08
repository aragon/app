import type { IGetWorkspaceParams } from './workspaceService.api';

export enum WorkspaceServiceKey {
    WORKSPACE = 'WORKSPACE',
    WORKSPACE_LIST = 'WORKSPACE_LIST',
}

export const workspaceServiceKeys = {
    workspace: (params: IGetWorkspaceParams) => [
        WorkspaceServiceKey.WORKSPACE,
        params,
    ],
    workspaceList: () => [WorkspaceServiceKey.WORKSPACE_LIST],
};
