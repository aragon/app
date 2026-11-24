import type { WorkspaceRegistryScope } from './domain';
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
    /**
     * Each registry is cached apart, so the demo list never stands in for the persistent one. Without a scope, the key
     * matches the lists of every registry, e.g. to invalidate them after a write.
     */
    workspaceList: (scope?: WorkspaceRegistryScope) =>
        scope == null
            ? [WorkspaceServiceKey.WORKSPACE_LIST]
            : [WorkspaceServiceKey.WORKSPACE_LIST, scope],
};
