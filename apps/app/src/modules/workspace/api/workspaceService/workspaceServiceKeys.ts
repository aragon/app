import type { IGetWorkspaceParams } from './workspaceService.api';

export enum WorkspaceServiceKey {
    WORKSPACE = 'WORKSPACE',
}

export const workspaceServiceKeys = {
    workspace: (params: IGetWorkspaceParams) => [
        WorkspaceServiceKey.WORKSPACE,
        params,
    ],
};
