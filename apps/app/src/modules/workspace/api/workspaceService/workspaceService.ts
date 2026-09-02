import { AragonBackendServiceError } from '@/shared/api/aragonBackendService';
import { workspaceMocks } from '../../constants/workspaceMocks';
import type { IWorkspace } from './domain';
import type { IGetWorkspaceParams } from './workspaceService.api';

/**
 * Workspace API.
 *
 * There is no workspace endpoint on the backend yet, so this service resolves workspaces from the local
 * {@link workspaceMocks} map. It is intentionally shaped like the other services (async, throws the same error type)
 * so that swapping the mock for a real request is a single-method change and no consumer needs to be touched.
 */
class WorkspaceService {
    getWorkspace = (params: IGetWorkspaceParams): Promise<IWorkspace> => {
        const { id } = params.urlParams;
        const workspace = workspaceMocks[id];

        if (workspace == null) {
            return Promise.reject(
                new AragonBackendServiceError(
                    AragonBackendServiceError.notFoundCode,
                    `Workspace not found (id=${id})`,
                    404,
                ),
            );
        }

        return Promise.resolve(workspace);
    };
}

export const workspaceService = new WorkspaceService();
