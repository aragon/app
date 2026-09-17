import { AragonBackendServiceError } from '@/shared/api/aragonBackendService';
import { workspaceMocks } from '../../constants/workspaceMocks';
import { workspaceUtils } from '../../utils/workspaceUtils';
import type { IWorkspace } from './domain';
import type {
    ICreateWorkspaceParams,
    IGetWorkspaceParams,
} from './workspaceService.api';

/**
 * Local-storage key holding the workspaces created through the app, keyed by workspace ID.
 */
export const workspaceStorageKey = 'aragon-workspaces';

/**
 * Workspace API.
 *
 * There is no workspace endpoint on the backend yet, so this service resolves workspaces from the {@link
 * workspaceMocks} seed merged with the workspaces persisted on local storage. It is intentionally shaped like the
 * other services (async, throws the same error type) so that swapping the mock for a real request is a
 * single-method change and no consumer needs to be touched.
 *
 * Local storage is only available on the client, therefore every method rejects when called on the server. This is
 * why the workspace pages must not prefetch workspaces (see `docs/projectDocs/createWorkspace.md`).
 */
class WorkspaceService {
    getWorkspace = (params: IGetWorkspaceParams): Promise<IWorkspace> => {
        const { id } = params.urlParams;

        let workspaces: Record<string, IWorkspace>;

        try {
            workspaces = this.getWorkspaces();
        } catch (error: unknown) {
            return Promise.reject(error);
        }

        const workspace = workspaces[id];

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

    createWorkspace = (params: ICreateWorkspaceParams): Promise<IWorkspace> => {
        const { body } = params;

        let workspaces: Record<string, IWorkspace>;

        try {
            workspaces = this.getWorkspaces();
        } catch (error: unknown) {
            return Promise.reject(error);
        }

        const id = workspaceUtils.buildWorkspaceId(
            body.name,
            Object.keys(workspaces),
        );
        const workspace: IWorkspace = { ...body, id };

        try {
            const stored = { ...this.getStoredWorkspaces(), [id]: workspace };
            localStorage.setItem(workspaceStorageKey, JSON.stringify(stored));
        } catch (error: unknown) {
            return Promise.reject(
                new AragonBackendServiceError(
                    'workspaceStorageError',
                    `Unable to persist the workspace (id=${id}, error=${String(error)})`,
                    500,
                ),
            );
        }

        return Promise.resolve(workspace);
    };

    /**
     * Returns the seeded workspaces merged with the workspaces persisted on local storage.
     */
    private getWorkspaces = (): Record<string, IWorkspace> => ({
        ...workspaceMocks,
        ...this.getStoredWorkspaces(),
    });

    /**
     * Returns the workspaces persisted on local storage, ignoring corrupted entries.
     */
    private getStoredWorkspaces = (): Record<string, IWorkspace> => {
        if (typeof window === 'undefined') {
            throw new AragonBackendServiceError(
                'workspaceStorageUnavailable',
                'The workspace registry is only available on the client.',
                500,
            );
        }

        const rawWorkspaces = localStorage.getItem(workspaceStorageKey);

        if (rawWorkspaces == null) {
            return {};
        }

        try {
            return JSON.parse(rawWorkspaces) as Record<string, IWorkspace>;
        } catch {
            return {};
        }
    };
}

export const workspaceService = new WorkspaceService();
