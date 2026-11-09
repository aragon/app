import type { IGetWorkspaceParams } from './workspaceService.api';

export enum WorkspaceServiceKey {
    PINNED_WORKSPACE = 'PINNED_WORKSPACE',
    WORKSPACE = 'WORKSPACE',
    WORKSPACE_LIST = 'WORKSPACE_LIST',
}

export const workspaceServiceKeys = {
    workspace: (params: IGetWorkspaceParams) => [
        WorkspaceServiceKey.WORKSPACE,
        params,
    ],
    pinnedWorkspace: () => [WorkspaceServiceKey.PINNED_WORKSPACE],
    workspaceList: () => [WorkspaceServiceKey.WORKSPACE_LIST],
};
